# Tự chạy host (Self-Hosting)

## Tổng quan

Hướng dẫn này bao gồm việc tự host PTOps trên cơ sở hạ tầng của riêng bạn. Tuy nhiên, xin lưu ý rằng đối với các bản cài đặt production thực tế, việc tự thực hiện đơn độc sẽ rất nguy hiểm. Mặc dù chúng tôi cung cấp tất cả các tài liệu cần thiết ở đây, chúng tôi khuyên bạn nên sử dụng [Gói Enterprise](https://xyops.io/pricing) của chúng tôi. Gói này cung cấp cho bạn quyền truy cập vào dịch vụ onboarding tận tình của chúng tôi, nơi đội ngũ của chúng tôi sẽ hướng dẫn bạn qua từng bước, xác thực cấu hình của bạn và đảm bảo việc tích hợp của bạn vừa bảo mật vừa đáng tin cậy. Điều này cũng giúp bạn có được hỗ trợ ticket ưu tiên và hỗ trợ live chat từ kỹ sư PTOps.

## Điều kiện tiên quyết

Một điều cực kỳ quan trọng cần hiểu là bất kể bạn quyết định chạy PTOps ở đâu, server (hoặc container) đó cần phải **định địa chỉ được trên mạng của bạn bằng hostname của nó**. Đây là cách các server worker kết nối tới PTOps, vì vậy chúng cần một hostname cố định để phân giải thành một IP mà chúng có thể tiếp cận từ bất kỳ nơi nào. Với Docker, bạn nên đặt **hostname container** thành một địa chỉ có thể phân giải và tiếp cận được trên mạng của bạn.

## Khởi động nhanh (Quick-Start)

Để khởi động nhanh và đưa PTOps vào hoạt động với một server conductor duy nhất, bạn có thể sử dụng lệnh Docker sau (nhưng **làm ơn** hãy xem các lưu ý bên dưới, vì chúng cực kỳ quan trọng):

```sh
docker run \
	--detach \
	--init \
	--name "xyops-conductor-1" \
	--hostname "xyops01.internal.mycompany.com" \
	-e XYOPS_masters="xyops01.internal.mycompany.com" \
	-e XYOPS_xysat_local="true" \
	-e TZ="America/Los_Angeles" \
	-v xy-data:/opt/xyops/data \
	-v ./xyops01-conf:/opt/xyops/conf \
	-v ./xyops01-logs:/opt/xyops/logs \
	-v /var/run/docker.sock:/var/run/docker.sock \
	--restart unless-stopped \
	-p 5522:5522 \
	-p 5523:5523 \
	ghcr.io/pixlcore/xyops:latest
```

Dưới đây là file docker compose tương ứng:

```yaml
services:
  xyops01:
    image: ghcr.io/pixlcore/xyops:latest
    container_name: xyops-conductor-01
    hostname: xyops01.internal.mycompany.com

    init: true
    restart: unless-stopped

    environment:
      XYOPS_xysat_local: "true"
      XYOPS_masters: "xyops01.internal.mycompany.com"
      TZ: America/Los_Angeles

    volumes:
      - xy-data:/opt/xyops/data
      - ./xyops01-conf:/opt/xyops/conf
      - ./xyops01-logs:/opt/xyops/logs
      - /var/run/docker.sock:/var/run/docker.sock

    ports:
      - "5522:5522"
      - "5523:5523"

volumes:
  xy-data:
```

Vui lòng thay đổi `./xyops01-conf` và `./xyops01-logs` thành các vị trí thích hợp để thư mục cấu hình và log của PTOps nằm trên máy host.

Sau đó, truy cập http://localhost:5522/ trong trình duyệt của bạn (xem mục [TLS](#tls) bên dưới để thiết lập HTTPS). Một tài khoản administrator mặc định sẽ được tạo với username là `admin` và password là `admin`. Việc này sẽ tạo một volume Docker (`xy-data`) để lưu trữ cơ sở dữ liệu PTOps, theo mặc định là mô hình hybrid giữa một DB SQLite và chính filesystem cho việc lưu trữ file.

Một vài lưu ý:

- **Quan trọng:** Vui lòng thay đổi hostname mẫu `xyops01.internal.mycompany.com` thành hostname thực tế phân giải được và có thể định địa chỉ được trên mạng của bạn. **Nếu không có điều này, nhiều tính năng sẽ không hoạt động bình thường.**
	- Ngoài ra, bạn phải thay đổi biến môi trường `XYOPS_masters` để khớp với điều này, vì biến này định nghĩa "cluster" conductor của bạn (trong trường hợp này là một cluster chỉ có một thành viên).
- Thay đổi biến môi trường `TZ` thành múi giờ địa phương của bạn để xoay vòng log vào nửa đêm và reset số liệu thống kê hàng ngày một cách chính xác.
- Biến môi trường `XYOPS_xysat_local` khiến PTOps khởi chạy [xySat](#satellite) chạy ngầm trong cùng một container. Điều này giúp bạn có thể chạy các job ngay lập tức -- nó rất tốt cho việc thử nghiệm và lab gia đình, nhưng *không được khuyến nghị cho môi trường production*.
- Biến môi trường `XYOPS_masters` là cách bạn định nghĩa một cluster gồm nhiều server conductor (các hostname phân tách bằng dấu phẩy). Trong trường hợp này, chỉ cần đặt nó thành hostname của server primary.
- Nếu bạn có kế hoạch sử dụng container lâu dài, vui lòng đảm bảo [xoay vòng secret key](#secret-key-rotation) thường xuyên (ví dụ: vài tháng một lần).
- Liên kết `/var/run/docker.sock` là tùy chọn, và cho phép PTOps khởi chạy các container của chính nó (ví dụ: cho [Docker Plugin](plugins.md#docker-plugin), và [Plugin Marketplace](marketplace.md)).

Lưu ý rằng để thêm các server worker, container cần phải *định địa chỉ được trên mạng của bạn* bằng hostname của nó. Thông thường, điều này được thực hiện bằng cách thêm hostname vào DNS nội bộ, Tailscale hoặc sử dụng file `/etc/hosts`. Xem [Thêm server](servers.md#adding-servers) để biết thêm chi tiết.

### Cấu hình chính

File cấu hình chính của PTOps nằm ở `/opt/xyops/conf/config.json`, nhưng cũng có các file hữu ích khác trong thư mục `/opt/xyops/conf`. Ví dụ: nếu bất kỳ thuộc tính cấu hình nào được cập nhật thông qua UI, chúng sẽ được ghi vào file `/opt/xyops/conf/overrides.json`. Nếu bạn định sử dụng container Docker lâu dài, tốt nhất là map toàn bộ thư mục `/opt/xyops/conf`. Bạn có thể thực hiện việc này dưới dạng volume hoặc bind mount nó vào một thư mục host (khuyến nghị):

```
-v ./xyops01-conf:/opt/xyops/conf
```

PTOps sẽ tự động sao chép tất cả các file cấu hình mặc định trong lần khởi chạy đầu tiên.

Xem [Hướng dẫn cấu hình](config.md) để biết chi tiết đầy đủ về cách tùy chỉnh file `config.json`.

## Cài đặt thủ công

Phần này bao gồm việc cài đặt PTOps thủ công trên một server (ngoài Docker).

Vui lòng lưu ý rằng conductor PTOps hiện chỉ hoạt động trên các hệ điều hành tương thích với POSIX, về cơ bản có nghĩa là Unix/Linux và macOS. Bạn cũng sẽ cần cài đặt sẵn [Node.js](https://nodejs.org/en/download/) trên server của mình. Chúng tôi **khuyên bạn nên cài đặt phiên bản LTS của Node.js**. Mặc dù PTOps sẽ hoạt động trên kênh phát hành "current", LTS ổn định hơn và được thử nghiệm rộng rãi hơn. Xem [Các bản phát hành Node.js](https://nodejs.org/en/about/releases/) để biết chi tiết.

PTOps cũng yêu cầu NPM phải được cài đặt sẵn. Thông thường, NPM được đóng gói và tự động cài đặt cùng với Node.js, nhưng nếu bạn cài đặt Node.js thủ công, bạn có thể phải tự cài đặt NPM. Bạn cũng có thể cần các công cụ compiler (ví dụ: `apt-get install build-essential python3-setuptools` trên Ubuntu).

Sau khi bạn đã cài đặt Node.js và NPM, hãy nhập lệnh này dưới quyền root:

```sh
curl -s https://raw.githubusercontent.com/pixlcore/xyops/main/bin/install.js | node
```

Thao tác này sẽ cài đặt phiên bản ổn định mới nhất của PTOps và tất cả các dependency của nó dưới thư mục: `/opt/xyops/`

Nếu bạn muốn cài đặt nó thủ công (hoặc cài đặt dưới dạng user không phải root), đây là các lệnh thô:

```sh
mkdir -p /opt/xyops && cd /opt/xyops
curl -L https://github.com/pixlcore/xyops/archive/v1.0.0.tar.gz | tar zxvf - --strip-components 1
npm install
node bin/build.js dist
bin/control.sh start
```

Thay thế `v1.0.0` bằng phiên bản PTOps mong muốn từ [danh sách phát hành chính thức](https://github.com/pixlcore/xyops/releases), hoặc `main` cho phiên bản head revision (không ổn định).

Nếu bạn muốn PTOps tự động khởi động khi reboot server, hãy chạy lệnh này:

```sh
cd /opt/xyops
npm run boot
```

**Đối với người dùng Linux:** Khi bạn chạy `npm run boot` để đăng ký PTOps dưới dạng một dịch vụ Systemd, bạn nên luôn khởi động / dừng nó bằng các lệnh `systemctl` thích hợp. Tên dịch vụ là `xyops.service`.

### Dòng lệnh (Command Line)

Xem [Hướng dẫn dòng lệnh](cli.md) của chúng tôi để kiểm soát dịch vụ PTOps qua dòng lệnh.

### Thêm conductor thủ công

Khi bạn cài đặt PTOps thủ công, nó sẽ tạo ra một cluster gồm một thành viên và tự phong nó làm primary. Để thêm các conductor dự phòng, hãy làm theo các hướng dẫn sau.

Đầu tiên, đối với các thiết lập đa conductor, **bạn phải có bộ lưu trữ ngoài được chia sẻ**. Đối với môi trường production thực tế, chúng tôi khuyên bạn nên thiết lập lưu trữ Hybrid bằng cách sử dụng Redis hoặc Postgres cho dữ liệu JSON, cộng với S3 hoặc dịch vụ tương thích S3 cho các file. Xem [Thiết lập lưu trữ](storage.md) để biết chi tiết.

Khi bạn đã thiết lập lưu trữ ngoài và hoạt động bình thường, hãy dừng dịch vụ PTOps và chỉnh sửa file `/opt/xyops/conf/masters.json`:

```json
{
	"masters": [
		"xyops01.internal.mycompany.com"
	]
}
```

**Lưu ý:** Nếu bạn đang sử dụng Docker, điều này có thể được chỉ định qua biến môi trường `XYOPS_masters` (biến này được phân tách bằng dấu phẩy và ghi ra file `masters.json` khi khởi động). Vì vậy, bạn chỉ cần thay đổi biến môi trường và không cần chỉnh sửa file thủ công.

Thêm hostname của server mới vào mảng `masters` trong file `masters.json` (hoặc dưới dạng danh sách phân tách bằng dấu phẩy trong `XYOPS_masters` cho các thiết lập Docker). Hãy nhớ rằng cả hai server cần có khả năng tiếp cận nhau qua hostname của chúng.

Sau đó, cài đặt phần mềm lên server mới và sao chép các file sau trước khi khởi động dịch vụ:

```
/opt/xyops/conf/config.json
/opt/xyops/conf/overrides.json
/opt/xyops/conf/masters.json
```

Cuối cùng, khởi động dịch vụ trên cả hai server. Chúng sẽ tự thương lượng và một server sẽ được thăng cấp làm primary sau 10 giây (hostname nào sắp xếp trước theo bảng chữ cái).

Lưu ý rằng hostname của server conductor **không thể thay đổi**. Nếu thay đổi, bạn sẽ cần cập nhật file `/opt/xyops/conf/masters.json` trên tất cả các server và khởi động lại mọi thứ (hoặc, nếu sử dụng Docker, hãy thay đổi tất cả các biến môi trường `XYOPS_masters` trên tất cả các container conductor của bạn).

Để có tính năng tự động failover hoàn toàn trong suốt bằng cách sử dụng một hostname duy nhất hướng tới người dùng, hãy xem mục [Đa conductor với Nginx](#multi-conductor-with-nginx) bên dưới.

### Gỡ cài đặt

Để gỡ cài đặt PTOps, chỉ cần dừng dịch vụ và xóa thư mục `/opt/xyops`.

```sh
cd /opt/xyops
bin/control.sh stop
npm run unboot # hủy đăng ký làm dịch vụ khởi động hệ thống
rm -rf /opt/xyops
cd -
```

Đảm bảo rằng bạn đã [ngưng hoạt động các server](servers.md#decommissioning-servers) trước.

## Biến môi trường

PTOps hỗ trợ cú pháp biến môi trường đặc biệt, có thể chỉ định các tùy chọn dòng lệnh cũng như ghi đè bất kỳ thiết lập cấu hình nào. Cú pháp tên biến là `XYOPS_key` trong đó `key` là một trong số các tùy chọn dòng lệnh (xem bảng bên dưới) hoặc một đường dẫn thuộc tính cấu hình JSON. Những biến này có thể hữu ích cho việc tự động hóa cài đặt và sử dụng các hệ thống container.

Để ghi đè các thuộc tính cấu hình bằng biến môi trường, bạn có thể chỉ định bất kỳ key JSON cấp cao nhất nào từ `config.json`, hoặc một *đường dẫn* đến thuộc tính lồng nhau bằng cách sử dụng dấu gạch dưới kép (`__`) làm dấu phân cách đường dẫn. Đối với các thuộc tính boolean, bạn có thể sử dụng chuỗi `true` hoặc `false`, và PTOps sẽ tự động chuyển đổi chúng. Dưới đây là ví dụ về một số khả năng khả dụng:

| Biến | Giá trị mẫu | Mô tả |
|----------|--------------|-------------|
| `XYOPS_foreground` | `true` | Chạy PTOps ở chế độ foreground (không fork daemon chạy ngầm). |
| `XYOPS_echo` | `true` | Echo event log ra console (STDOUT), sử dụng kết hợp với `XYOPS_foreground`. |
| `XYOPS_color` | `true` | Echo event log với các cột được mã hóa màu, sử dụng kết hợp với `XYOPS_echo`. |
| `XYOPS_base_app_url` | `http://xyops.mycompany.com` | Ghi đè thuộc tính cấu hình [base_app_url](config.md#base_app_url). |
| `XYOPS_email_from` | `xyops@mycompany.com` | Ghi đè thuộc tính cấu hình [email_from](config.md#email_from). |
| `XYOPS_WebServer__port` | `80` | Ghi đè thuộc tính `port` *bên trong* object [WebServer](config.md#webserver). |
| `XYOPS_WebServer__https_port` | `443` | Ghi đè thuộc tính `https_port` *bên trong* object [WebServer](config.md#webserver). |
| `XYOPS_Storage__Filesystem__base_dir` | `/data/xyops` | Ghi đè thuộc tính `base_dir` *bên trong* object [Filesystem](config.md#storage-filesystem) lồng trong object [Storage](config.md#storage). |

Hầu như mọi [thuộc tính cấu hình](config.md) đều có thể được ghi đè bằng cú pháp biến môi trường này. Các ngoại lệ duy nhất là các thuộc tính dạng mảng, ví dụ: [log_columns](config.md#log_columns).

## Backup hàng ngày

Dưới đây là cách bạn có thể tạo bản backup hàng ngày cho dữ liệu PTOps quan trọng, bất kể công cụ lưu trữ phụ trợ của bạn là gì. Đầu tiên, hãy tạo một [API Key](api.md#api-keys) và cấp cho nó privilege [bulk_export](privileges.md#bulk_export) (điều này là bắt buộc để sử dụng API [admin_export_data](api.md#admin_export_data)). Sau đó, bạn có thể yêu cầu một bản backup bằng lệnh [curl](https://curl.se/) như thế này:

```sh
curl -X POST "https://xyops.mycompany.com/api/app/admin_export_data" \
	-H "X-API-Key: YOUR_API_KEY_HERE" -H "Content-Type: application/json" \
	-d '{"lists":"all","indexes":["tickets"]}' -O -J
```

Thao tác này sẽ lưu bản backup dưới dạng file `.txt.gz` trong thư mục hiện tại được đặt tên theo pattern file này:

```
ptops-data-export-YYYY-MM-DD-UNIQUEID.txt.gz
```

Vui lòng lưu ý rằng ví dụ này sẽ chỉ export dữ liệu **quan trọng** và không phải là bản backup đầy đủ (đặc biệt thiếu lịch sử job, lịch sử alert, lịch sử snapshot, lịch sử server và log hoạt động). Để backup *mọi thứ*, hãy thay đổi JSON trong yêu cầu curl thành: `{"lists":"all","indexes":"all","extras":"all"}`. Lưu ý rằng việc này có thể mất khá nhiều thời gian và tạo ra một file rất lớn tùy thuộc vào kích thước cơ sở dữ liệu PTOps của bạn. Để giới hạn chính xác những gì được đưa vào bản backup, hãy tham khảo tài liệu API [admin_export_data](api.md#admin_export_data).

### Backup SQLite

Nếu bạn đang sử dụng cấu hình lưu trữ mặc định (SQLite + Filesystem), thì PTOps sẽ giữ các bản backup SQLite hàng ngày được nén trong 7 ngày theo mặc định. Các bản backup này chủ yếu phục vụ cho mục đích khôi phục sau sự cố. Bạn có thể cấu hình hoặc tắt tính năng backup trong object cấu hình [Storage.SQLite](config.md#storage-sqlite):

```json
"SQLite": {
	"base_dir": "data",
	"filename": "sqlite.db",
	"pragmas": {
		"auto_vacuum": 0,
		"cache_size": -100000,
		"journal_mode": "WAL"
	},
	"cache": {
		"enabled": true,
		"maxItems": 100000,
		"maxBytes": 104857600
	},
	"backups": {
		"enabled": true,
		"dir": "data/backups",
		"filename": "backup-[yyyy]-[mm]-[dd]-[hh]-[mi]-[ss].db",
		"compress": true,
		"keep": 7
	}
}
```

Lưu ý rằng SQLite chỉ lưu trữ dữ liệu chứ không lưu trữ "file" theo cấu hình hybrid SQLite + Filesystem mặc định. Vì vậy, các bản backup này chủ yếu dùng để khôi phục từ các tình huống thảm họa nghiêm trọng như hết dung lượng ổ đĩa (nơi DB có thể bị hỏng). Chúng không phải là các bản backup "hoàn chỉnh", vì chúng không chứa các file job, file bucket, file đính kèm ticket, file upload của user, v.v.

## TLS

Web server tích hợp sẵn của PTOps ([pixl-server-web](https://github.com/jhuckaby/pixl-server-web)) hỗ trợ TLS, nhưng bạn sẽ cần một chứng chỉ hợp lệ để tất cả các tính năng hoạt động chính xác. Vui lòng đọc hướng dẫn sau để biết hướng dẫn thiết lập:

[Chứng chỉ TLS Let's Encrypt / ACME](https://github.com/jhuckaby/pixl-server-web#lets-encrypt--acme-tls-certificates)

Ngoài ra, bạn có thể thiết lập một proxy đứng trước PTOps và xử lý TLS cho bạn (xem phần tiếp theo).

## Đa conductor với Nginx

Để có thiết lập đa conductor tải cân bằng với Nginx kèm TLS, vui lòng đọc phần này. Đây là một thiết lập phức tạp và đòi hỏi kiến thức nâng cao về tất cả các thành phần được sử dụng. Chúng tôi khuyên bạn nên sử dụng [Gói Enterprise](https://xyops.io/pricing) ở đây, vì chúng tôi có thể thiết lập tất cả những điều này cho bạn. Cách hoạt động của cấu hình này như sau:

- [Nginx](https://nginx.org/) đứng trước và xử lý kết thúc TLS, cũng như định tuyến các yêu cầu đến các backend khác nhau.
- Nginx xử lý đa conductor của PTOps bằng cách sử dụng một [Health Check Daemon](https://github.com/pixlcore/xyops-healthcheck) tích hợp sẵn chạy trong cùng một container.
	- Trình kiểm tra sức khỏe theo dõi xem server conductor nào là primary, và tự động cấu hình lại cũng như hot-reload Nginx khi cần thiết.
	- Chúng tôi duy trì image docker Nginx tùy chỉnh của riêng mình cho việc này (hiển thị bên dưới), hoặc bạn có thể [tự build từ mã nguồn](https://github.com/pixlcore/xyops-nginx/blob/main/Dockerfile).

Một vài điều kiện tiên quyết cho thiết lập này:

- Đối với các thiết lập đa conductor, **bạn phải có bộ lưu trữ ngoài được chia sẻ**. Đối với môi trường production thực tế, chúng tôi khuyên bạn nên thiết lập lưu trữ Hybrid bằng cách sử dụng Redis hoặc Postgres cho dữ liệu JSON, cộng với S3 hoặc dịch vụ tương thích S3 cho các file. Xem [Thiết lập lưu trữ](storage.md) để biết chi tiết.
- Bạn sẽ cần một custom domain được cấu hình và các chứng chỉ TLS được tạo sẵn sàng để đính kèm.
- Bạn đã có file cấu hình PTOps được tùy chỉnh và sẵn sàng hoạt động ([config.json](https://github.com/pixlcore/xyops/blob/main/sample_conf/config.json)) (xem bên dưới).

Đối với các ví dụ bên dưới, chúng tôi sẽ sử dụng các domain mẫu sau:

- `xyops.mycompany.com` - Domain hướng tới user để định tuyến tới Nginx / SSO.
- `xyops01.internal.mycompany.com` - Domain nội bộ cho server conductor #1.
- `xyops02.internal.mycompany.com` - Domain nội bộ cho server conductor #2.

Lý do tại sao các server conductor mỗi bên cần hostname (domain nội bộ) duy nhất của riêng chúng là vì cách thức hoạt động của hệ thống đa conductor. Mỗi server conductor cần phải có thể định địa chỉ riêng biệt và có thể tiếp cận được bởi tất cả các server worker trong tổ chức của bạn. Các server worker không biết hoặc quan tâm đến Nginx -- chúng liên hệ trực tiếp với các conductor và có hệ thống tự động failover của riêng chúng. Ngoài ra, các server worker sử dụng một kết nối WebSocket bền bỉ và có thể gửi một lượng lớn lưu lượng truy cập, tùy thuộc vào số lượng server worker bạn có và số lượng job bạn chạy. Vì những lý do này, tốt hơn là để các server worker kết nối trực tiếp với các conductor, đặc biệt là ở quy mô production.

Mặc dù vậy, bạn *có thể* cấu hình các server worker của mình kết nối thông qua cổng Nginx phía trước nếu muốn. Điều này có thể hữu ích nếu bạn có các server worker trong một mạng khác hoặc ngoài môi trường công cộng, nhưng nó không được khuyến nghị cho hầu hết các thiết lập. Để làm điều này, vui lòng xem mục [Ghi đè URL kết nối](hosting.md#overriding-the-connect-url) trong hướng dẫn tự host của chúng tôi.

Dưới đây là lệnh docker để chạy Nginx:

```sh
docker run \
	--detach \
	--init \
	--name xyops-nginx \
	-e XYOPS_masters="xyops01.internal.mycompany.com,xyops02.internal.mycompany.com" \
	-e XYOPS_port="5522" \
	-v "$(pwd)/tls.crt:/etc/tls.crt:ro" \
	-v "$(pwd)/tls.key:/etc/tls.key:ro" \
	-p 443:443 \
	ghcr.io/pixlcore/xyops-nginx:latest
```

Dưới đây là file docker compose tương ứng:

```yaml
services:
  nginx:
    image: ghcr.io/pixlcore/xyops-nginx:latest
    init: true
    environment:
      XYOPS_masters: xyops01.internal.mycompany.com,xyops02.internal.mycompany.com
      XYOPS_port: 5522
    volumes:
      - "./tls.crt:/etc/tls.crt:ro"
      - "./tls.key:/etc/tls.key:ro"
    ports:
      - "443:443"
```

Hãy nói về thiết lập Nginx. Chúng tôi đang kéo Docker image của riêng mình về đây ([xyops-nginx](https://github.com/pixlcore/xyops-nginx)). Đây là một wrapper xung quanh image docker Nginx chính thức, nhưng nó bao gồm daemon [PTOps Health Check](https://github.com/pixlcore/xyops-healthcheck) của chúng tôi. Trình kiểm tra sức khỏe theo dõi xem server conductor nào hiện là primary, và cấu hình lại Nginx động khi đang hoạt động nếu cần thiết (vì vậy Nginx luôn chỉ định tuyến đến server primary hiện tại). Image cũng đi kèm với một Nginx được cấu hình sẵn hoàn toàn. Để sử dụng image này, bạn sẽ cần cung cấp:

- Các file chứng chỉ TLS của bạn, được đặt tên là `tls.crt` và `tls.key`, được bind tương ứng vào `/etc/tls.crt` và `/etc/tls.key`.
- Danh sách tên domain của các server conductor PTOps dưới dạng danh sách CSV trong biến môi trường `XYOPS_masters` (được sử dụng bởi health check).

Khi bạn đã có Nginx chạy, chúng ta có thể khởi động PTOps backend. Điều này được ghi nhận riêng biệt vì bạn thường muốn chạy các server riêng biệt. Dưới đây là cấu hình đa conductor dưới dạng một lệnh Docker run duy nhất:

```sh
docker run \
	--detach \
	--init \
	--name xyops-conductor-1 \
	--hostname xyops01.internal.mycompany.com \
	-e XYOPS_masters="xyops01.internal.mycompany.com,xyops02.internal.mycompany.com" \
	-e TZ="America/Los_Angeles" \
	-v "./xyops01-conf:/opt/xyops/conf" \
	-v "./xyops01-logs:/opt/xyops/logs" \
	-v "/var/run/docker.sock:/var/run/docker.sock" \
	--restart unless-stopped \
	-p 5522:5522 \
	-p 5523:5523 \
	ghcr.io/pixlcore/xyops:latest
```

Và dưới đây là file docker compose tương ứng:

```yaml
services:
  xyops1:
    image: ghcr.io/pixlcore/xyops:latest
    container_name: xyops-conductor-01
    hostname: xyops01.internal.mycompany.com # thay đổi thuộc tính này trên mỗi server conductor
    init: true
    environment:
      XYOPS_masters: xyops01.internal.mycompany.com,xyops02.internal.mycompany.com
      TZ: America/Los_Angeles
    volumes:
      - "./xyops01-conf:/opt/xyops/conf"
      - "./xyops01-logs:/opt/xyops/logs"
      - "/var/run/docker.sock:/var/run/docker.sock"
    ports:
      - "5522:5522"
      - "5523:5523"
```

Đối với các server conductor bổ sung, bạn chỉ cần sao chép lệnh và thay đổi hostname.

Một vài điều cần lưu ý ở đây:

- Chúng tôi đang sử dụng Docker image PTOps chính thức của mình, nhưng bạn luôn có thể [tự build từ mã nguồn](https://github.com/pixlcore/xyops/blob/main/Dockerfile).
- Tất cả các hostname của server conductor cần phải được liệt kê trong biến môi trường `XYOPS_masters`, phân tách bằng dấu phẩy.
- Tất cả các server conductor cần phải định tuyến được tới nhau thông qua hostname của chúng, để chúng có thể tự thương lượng và tổ chức bầu cử.
- Múi giờ (`TZ`) nên được đặt thành múi giờ chính của công ty bạn, để những việc như xoay vòng log vào nửa đêm và reset số liệu thống kê hàng ngày hoạt động như mong đợi.
- Liên kết `/var/run/docker.sock` cho phép PTOps khởi chạy các container của riêng nó (ví dụ: cho [Plugin Marketplace](marketplace.md)).
- Đường dẫn `./xyops01-conf` nên được thay đổi thành một vị trí trên host nơi bạn muốn lưu trữ thư mục cấu hình PTOps.
	- PTOps sẽ tự động điền dữ liệu vào thư mục này trong lần chạy container đầu tiên.
	- Mỗi conductor cần một thư mục cấu hình duy nhất (chúng không thể dùng chung).
	- Xem [Hướng dẫn cấu hình PTOps](config.md) để biết chi tiết về cách tùy chỉnh file `config.json` trong thư mục này.
- Đường dẫn `./xyops01-logs` nên được thay đổi thành một vị trí trên host nơi bạn muốn lưu trữ thư mục log PTOps.

## Bộ lưu trữ ngoài (External Storage)

Để sử dụng một hệ thống lưu trữ ngoài, bạn có [một số tùy chọn để lựa chọn](storage.md). Đối với các thiết lập đa conductor môi trường production thực tế, hiện tại chúng tôi khuyên dùng **Redis + S3** hoặc **Postgres + S3** thông qua công cụ lưu trữ Hybrid. Phía S3 có thể là AWS S3 hoặc một dịch vụ tương thích S3 như MinIO hoặc RustFS.

Để biết thêm chi tiết, xem [Hướng dẫn thiết lập lưu trữ](storage.md).

## Satellite

**PTOps Satellite ([xySat](https://github.com/pixlcore/xysat))** là một người bạn đồng hành của hệ thống PTOps. Nó vừa là một runner job, vừa là một bộ thu thập dữ liệu để monitor server và alert. xySat được thiết kế để cài đặt trên *tất cả* các server của bạn, vì vậy nó rất tinh gọn, mạnh mẽ và không có dependency nào.

Để biết hướng dẫn về cách cài đặt xySat, xem [Thêm server](servers.md#adding-servers).

### Cấu hình Satellite

xySat được cấu hình tự động thông qua server conductor PTOps. Object [satellite.config](config.md#satellite-config) được tự động gửi đến mỗi server sau khi nó kết nối và xác thực, vì vậy bạn có thể giữ một phiên bản cấu hình xySat trên conductor và nó sẽ tự động đồng bộ hóa với tất cả các server. Dưới đây là cấu hình mặc định:

```json
{ 
	"port": 5522,
	"secure": false,
	"socket_opts": { "rejectUnauthorized": false },
	"pid_file": "pid.txt",
	"log_dir": "logs",
	"log_filename": "[component].log",
	"log_crashes": true,
	"log_archive_path": "logs/archives/[filename]-[yyyy]-[mm]-[dd].log.gz",
	"log_archive_keep": "7 days",
	"temp_dir": "temp",
	"debug_level": 5,
	"child_kill_timeout": 10,
	"monitoring_enabled": true,
	"quickmon_enabled": true,
	"upgrade_timeout_sec": 60
}
```

Dưới đây là mô tả của các thuộc tính cấu hình:

| Tên thuộc tính | Kiểu | Mô tả |
|---------------|------|-------------|
| `port` | Số | Chỉ định cổng mà server conductor PTOps sẽ lắng nghe (mặc định là `5522` cho ws:// và `5523` cho wss://). |
| `secure` | Boolean | Đặt thành `true` để sử dụng các kết nối WebSocket bảo mật (wss://) và HTTPS. |
| `socket_opts` | Object | Các tùy chọn để chuyển qua kết nối WebSocket (xem [WebSocket](https://github.com/websockets/ws/blob/master/doc/ws.md#class-websocket)). |
| `pid_file` | Chuỗi | Vị trí của file PID để đảm bảo hai satellite không chạy đồng thời. |
| `log_dir` | Chuỗi | Vị trí của thư mục log, tương đối với thư mục gốc của xySat (`/opt/xyops/satellite`). |
| `log_filename` | Chuỗi | Chuỗi này là pattern tên file được sử dụng bởi core logger (mặc định: `[component].log`); hỗ trợ các placeholder cột log như `[component]`. |
| `log_crashes` | Boolean | Giá trị boolean này cho phép ghi lại các ngoại lệ không được bắt (uncaught exception) và crash trong hệ thống con logger (mặc định: `true`). |
| `log_archive_path` | Chuỗi | Chuỗi này đặt pattern đường dẫn lưu trữ log hàng đêm (mặc định: `logs/archives/[filename]-[yyyy]-[mm]-[dd].log.gz`). |
| `log_archive_keep` | Chuỗi | Số ngày giữ lại các file lưu trữ log trước khi tự động xóa các file cũ nhất. |
| `temp_dir` | Chuỗi | Vị trí của thư mục tạm thời (temp), tương đối với thư mục gốc (`/opt/xyops/satellite`). |
| `debug_level` | Số | Số này thiết lập mức độ chi tiết của logger (mặc định: `5`; 1 = im lặng, 10 = rất chi tiết). |
| `child_kill_timeout` | Số | Số giây chờ đợi sau khi gửi SIGTERM trước khi tiếp tục gửi SIGKILL. |
| `monitoring_enabled` | Boolean | Bật hoặc tắt hệ thống con monitoring (ví dụ: gửi các metric monitoring mỗi phút). |
| `quickmon_enabled` | Boolean | Bật hoặc tắt các quick monitor, vốn gửi các metric nhẹ mỗi giây. |
| `upgrade_timeout_sec` | Số | Số giây cho phép hoàn tất việc nâng cấp trước khi báo lỗi (mặc định: `60`). |

### Ghi đè URL kết nối

Khi xySat được cài đặt lần đầu, nó được cung cấp một mảng các host để kết nối, mảng này trở thành mảng `hosts` trong file config xySat trên mỗi server. Khi xySat khởi động, nó kết nối với một *host ngẫu nhiên* từ mảng này, xác định conductor nào là primary, và kết nối lại với host đó. Nếu cluster conductor thay đổi, một mảng `hosts` mới sẽ tự động được phân phối tới tất cả các server bởi conductor hiện tại.

Trong một số tình huống nhất định, bạn có thể cần xySat kết nối với một host conductor cụ thể, thay vì danh sách conductor mặc định. Ví dụ: bạn có thể có các server ở ngoài môi trường công cộng và chúng cần kết nối qua một proxy, hoặc một loại kiến trúc mạng phức tạp nào khác. Dù bằng cách nào, bạn có thể ghi đè mảng host thông thường mà xySat kết nối tới và thay vào đó chỉ định một giá trị tĩnh.

Để làm điều này, hãy thêm thuộc tính `host` vào config xySat dưới dạng thuộc tính JSON cấp cao nhất trên mỗi server yêu cầu điều đó. File config xySat nằm ở:

```
/opt/xyops/satellite/config.json
```

Lưu ý rằng bạn **không nên** thêm thuộc tính `host` vào object [satellite.config](config.md#satellite-config) trên server conductor, trừ khi bạn muốn **tất cả** các server của mình kết nối với host tĩnh đó.

Khi cả `hosts` và `host` đều tồn tại trong file config, `host` sẽ được ưu tiên hơn.

### Tùy chỉnh các key được quản lý (Managed Keys)

Theo mặc định, toàn bộ object cấu hình satellite từ server conductor primary được phân phối ra tất cả các server từ xa khi chúng kết nối, và khối cấu hình đó sẽ *ghi đè* bất kỳ thứ gì có trong file `/opt/xyops/satellite/config.json` cục bộ của chúng. Điều này được thiết kế có ý đồ, để bạn có thể duy trì một cấu hình satellite trung tâm duy nhất, thay đổi nó bất kỳ lúc nào, và để nó tự động đồng bộ hóa với tất cả các server của bạn.

Tuy nhiên, nếu bạn có một thiết lập tùy chỉnh mà bạn muốn một số server của mình có cấu hình khác nhau, điều này là có thể. Trên những server cụ thể đó, hãy thêm một thuộc tính `managed_keys` vào file `/opt/xyops/satellite/config.json` của chúng, và điền vào mảng này tất cả các key mà bạn muốn cho phép PTOps tự động "quản lý" (tức là những key nào bạn muốn cho phép nó ghi đè). Ví dụ:

```json
"managed_keys": [ "server_id", "auth_token", "hosts" ]
```

Điều này chỉ cho phép PTOps ghi đè các key cấu hình `server_id`, `auth_token` và `hosts` khi server kết nối. Tất cả các thuộc tính cấu hình khác có thể khác nhau và sẽ không bị chạm vào. Lưu ý rằng một điều quan trọng là luôn cho phép thuộc tính `auth_token` bị ghi đè, để bạn có thể [xoay vòng secret key](#secret-key-rotation) từ conductor (xoay vòng secret key yêu cầu tất cả các token xác thực của server phải được tạo lại).

## Server Proxy

Để gửi tất cả các yêu cầu gửi đi (outbound request) thông qua một proxy (ví dụ: đối với webhook), chỉ cần đặt một hoặc nhiều [biến môi trường tiêu chuẩn thực tế](https://curl.se/docs/manpage.html#ENVIRONMENT) được sử dụng cho mục đích này:

```
HTTPS_PROXY
HTTP_PROXY
ALL_PROXY
NO_PROXY
```

PTOps sẽ phát hiện các biến môi trường này và tự động cấu hình định tuyến proxy cho tất cả các yêu cầu gửi đi. Tên biến môi trường có thể viết hoa hoặc viết thường. Định dạng proxy phải là một URL đầy đủ có số cổng. Để thiết lập một server proxy duy nhất xử lý cả yêu cầu HTTP và HTTPS, cách đơn giản nhất là chỉ cần thiết lập `ALL_PROXY` (thường được chỉ định qua một URL HTTP thông thường có cổng). Ví dụ:

```
ALL_PROXY=http://company-proxy-server.com:8080
```

Sử dụng biến môi trường `NO_PROXY` để chỉ định danh sách domain whitelist phân tách bằng dấu phẩy. Các yêu cầu đến bất kỳ domain nào trong danh sách này sẽ bỏ qua proxy và được gửi trực tiếp. Ví dụ:

```
NO_PROXY=direct.example.com
```

Vui lòng lưu ý rằng đối với việc proxy các yêu cầu HTTPS (SSL), trừ khi bạn đã cấu hình trước các máy của mình để tin tưởng chứng chỉ SSL cục bộ của proxy, bạn sẽ phải bật tùy chọn "Bỏ qua chứng chỉ SSL" (SSL Cert Bypass) trong các webhook của mình.

Các loại proxy được hỗ trợ là:

| Giao thức | Ví dụ |
|----------|---------|
| `http` | `http://proxy-server-over-tcp.com:3128` |
| `https` | `https://proxy-server-over-tls.com:3129` |
| `socks` | `socks://username:password@some-socks-proxy.com:9050` |
| `socks5` | `socks5://username:password@some-socks-proxy.com:9050` |
| `socks4` | `socks4://some-socks-proxy.com:9050` |
| `pac-*` | `pac+http://www.example.com/proxy.pac` |

Đảm bảo thiết lập các biến môi trường này trên toàn bộ hệ thống server của bạn, để những thành phần như [HTTP Request Plugin](plugins.md#http-request-plugin) cũng tuân thủ theo.

## Di chuyển dữ liệu

Để di chuyển một bản cài đặt PTOps hiện có sang một server hoàn toàn mới, hãy sử dụng các tính năng export và import hàng loạt tích hợp sẵn từ tab **System**, nhưng hãy đảm bảo rằng bạn tự sao chép thư mục cấu hình bằng tay trước. Bản export hàng loạt chứa dữ liệu PTOps, nhưng nó **không** thay thế các file cấu hình server của bạn.

Trước khi bạn import bất cứ thứ gì trên server mới, hãy sao chép toàn bộ thư mục cấu hình từ conductor cũ:

```
/opt/xyops/conf
```

Thư mục này chứa cấu hình PTOps đầy đủ của bạn, các cấu hình ghi đè UI, các template email tùy chỉnh, tài sản UI tùy chỉnh, các thiết lập conductor peer, và quan trọng nhất là secret key của bạn. Secret key thường được lưu trữ trong:

```
/opt/xyops/conf/overrides.json
```

**Quan trọng:** Dữ liệu Secret Vault và các API Key của bạn được mã hóa bằng secret key, và việc xác thực conductor cùng worker cũng phụ thuộc vào nó. Bạn phải sao chép giá trị `secret_key` gốc sang server mới **trước khi** import dữ liệu hoặc thêm server. Nếu conductor mới bắt đầu với một secret key khác và bạn import dữ liệu cũ của mình, các secret được import sẽ không được giải mã chính xác và các server có thể không xác thực được. Miễn là bạn sao chép toàn bộ thư mục `/opt/xyops/conf` trước, các Secret và API Key được import của bạn sẽ hoạt động trên server mới.

Dưới đây là quy trình được khuyến nghị:

1. Trên server PTOps cũ, hãy vào mục **System** và nhấp vào **Export Data**.
2. Để di chuyển hoàn toàn, hãy chọn tất cả danh sách lưu trữ, tất cả các bảng cơ sở dữ liệu và tất cả các mục bổ sung mà bạn muốn bảo toàn.
3. Cài đặt PTOps trên server mới, nhưng chưa import dữ liệu vội.
4. Dừng PTOps trên server mới nếu nó đã chạy.
5. Sao chép toàn bộ thư mục `/opt/xyops/conf` từ server cũ sang server mới.
6. Xem lại cấu hình đã sao chép và chỉ cập nhật các thiết lập cụ thể của server, chẳng hạn như hostname, cổng, đường dẫn TLS, endpoint lưu trữ hoặc đường dẫn volume Docker.
7. Khởi động PTOps trên server mới và xác nhận rằng nó đang chạy với cấu hình đã sao chép.
8. Trong UI PTOps mới, đăng nhập bằng tài khoản admin mặc định, vào mục **System** và nhấp vào **Import Data**.
9. Tải lên archive đã export từ server cũ.
10. Xác minh user, API Key, Secret, event, workflow, plugin, bucket, schedule, worker và các file đã tải lên trước khi cho server cũ ngưng hoạt động.

Nếu bạn đang sử dụng Docker, hãy sao chép thư mục host mà bạn đã bind-mount vào `/opt/xyops/conf`, chẳng hạn như `./xyops01-conf` trong các ví dụ trên. Nếu bạn đang sử dụng cài đặt thủ công, hãy sao chép trực tiếp `/opt/xyops/conf`. Dù bằng cách nào, hãy giữ một bản backup của server cũ và archive đã export cho đến khi bạn đã xác thực hoàn toàn conductor mới.

## Chế độ Air-Gapped

PTOps hỗ trợ các cài đặt air-gapped, vốn ngăn nó thực hiện các kết nối gửi đi không được phép vượt quá một dải IP được chỉ định. Bạn có thể cấu hình dải IP nào được phép kết nối thông qua whitelist và/hoặc blacklist. Thiết lập thông thường là cho phép các yêu cầu LAN nội bộ để các server có thể giao tiếp với nhau trong hạ tầng của bạn.

Để cấu hình chế độ air-gapped, hãy sử dụng phần [airgap](config.md#airgap) trong file cấu hình chính. Ví dụ:

```json
"airgap": {
	"enabled": false,
	"whitelist": ["127.0.0.1", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "::1/128", "fd00::/8", "169.254.0.0/16", "fe80::/10"],
	"blacklist": []
}
```

Đặt thuộc tính `enabled` thành `true` để bật chế độ air-gapped, và đặt mảng `whitelist` và/hoặc `blacklist` thành các địa chỉ IP hoặc các [khối CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). Whitelist mặc định bao gồm tất cả các IP trong [dải riêng tư](https://en.wikipedia.org/wiki/Private_network).

Bạn cũng sẽ cần tắt thiết lập cấu hình "Hiển thị huy hiệu phiên bản cũ" ([client.outdated_badges](config.md#client-outdated_badges)). Điều này là để PTOps không cố gắng kiểm tra các phiên bản phần mềm cũ (việc này đòi hỏi phải gửi các yêu cầu ra bên ngoài tới GitHub).

Các quy tắc air-gapped áp dụng cho cả bản thân PTOps và tự động lan truyền đến tất cả các server worker được kết nối, để kiểm soát những thứ như [HTTP Plugin](plugins.md#http-request-plugin). Tuy nhiên, một điều quan trọng cần chỉ ra là chúng **không** kiểm soát code Plugin của riêng bạn, shell script của riêng bạn, cũng như các Plugin trên marketplace.

Để xử lý việc nâng cấp phần mềm air-gapped một cách an toàn, vui lòng liên hệ với [Hỗ trợ PTOps](mailto:support@pixlcore.com). Như một phần của gói enterprise, chúng tôi có thể gửi cho bạn các gói đã ký kỹ thuật số cùng với hướng dẫn cách cài đặt chúng.

Lưu ý rằng all tài liệu PTOps đều có sẵn ngoại tuyến bên trong ứng dụng PTOps.

### Cài đặt Satellite trong môi trường Air-Gapped

PTOps hỗ trợ cài đặt và nâng cấp server hoàn toàn air-gapped. Cách thức hoạt động như sau:

1. Như một phần trong [gói enterprise](https://xyops.io/pricing) của bạn, hãy yêu cầu chúng tôi cung cấp một gói phần mềm xySat đã ký.
2. Trong instance PTOps của bạn, tạo một [Storage Bucket](buckets.md) và ghi lại Bucket ID.
3. Tải các file bạn nhận được lên bucket. Tên file sẽ ở định dạng này: `satellite-OS-ARCH.tar.gz`.
4. Chỉnh sửa file config conductor của bạn và đặt thuộc tính `satellite.bucket` thành Bucket ID.
5. Cài đặt hoặc nâng cấp các server của bạn như bình thường.
6. PTOps sẽ sử dụng các gói cài đặt xySat từ bucket, và không yêu cầu bất kỳ thứ gì qua internet.

Đối với các container Docker, hãy đảm bảo rằng Docker cục bộ của bạn đã lưu trữ sẵn các image của chúng tôi, để chúng không bị kéo từ repository về. Các container chính thức của chúng tôi có sẵn tại các vị trí sau:

- **PTOps**: https://github.com/pixlcore/xyops/pkgs/container/xyops
- **xySat**: https://github.com/pixlcore/xysat/pkgs/container/xysat

## Xoay vòng Secret Key (Secret Key Rotation)

PTOps uses một secret key duy nhất trên mỗi server conductor. Key này mã hóa các secret được lưu trữ, ký các token UI tạm thời và cấp các token xác thực cho các server worker (xySat). Việc xoay vòng key này hoàn toàn tự động và được thực hiện từ UI.

### Tổng quan

- **Tạo khóa bảo mật**: Một key mới an toàn về mặt mã hóa được tạo bởi conductor primary và không bao giờ được truyền dưới dạng văn bản rõ (plaintext).
- **Điều phối xoay vòng**: Scheduler bị tạm dừng, các job trong hàng đợi bị loại bỏ (flush), và các job đang hoạt động bị hủy bỏ (abort) trước khi quá trình xoay vòng tiếp tục.
- **Tái mã hóa liền mạch**: Tất cả các secret được lưu trữ sẽ được mã hóa lại bằng key mới.
- **Xác thực lại**: Tất cả các server xySat đang kết nối sẽ được xác thực lại và tự động cấp các token xác thực mới.
- **Phân phối tới peer**: Key mới được phân phối tới tất cả các peer conductor (các conductor dự phòng) dưới dạng mã hóa bằng key trước đó.
- **Cấu hình bền vững**: Key mới được ghi vào file `/opt/xyops/conf/overrides.json`. File `config.json` cơ sở không bị sửa đổi theo thiết kế (thường được mount dưới dạng chỉ đọc trong Docker).
- **Không bị ảnh hưởng**: Các phiên làm việc hiện tại của user và các API key vẫn hợp lệ và không bị ảnh hưởng bởi việc xoay vòng key.

### Kiểm tra trước

Trước khi bắt đầu xoay vòng, hãy đảm bảo rằng tất cả các conductor và tất cả các server worker đều trực tuyến và khỏe mạnh:

- Xác minh rằng mọi conductor đều có thể tiếp cận được và đang tham gia vào cluster.
- Xác minh rằng tất cả các server worker đều hiển thị là trực tuyến trong danh sách Server.

Nếu một node ngoại tuyến trong quá trình xoay vòng, nó sẽ không nhận được cập nhật tự động. Xem mục [Khôi phục ngoại tuyến](#offline-recovery) bên dưới.

### Quy trình xoay vòng

1. Nhấp vào liên kết "System" trong phần Admin ở thanh bên, và bắt đầu Xoay vòng Key (Key Rotation).
2. Hệ thống tạm dừng scheduler, giải phóng các job trong hàng đợi và hủy bỏ các job đang hoạt động.
3. Một key mới được tạo và sử dụng để mã hóa lại tất cả các secret.
4. Các server worker đang kết nối được cấp các token xác thực mới.
5. Key mới được phân phối an toàn đến tất cả các peer conductor.
6. Key được lưu giữ vào file `/opt/xyops/conf/overrides.json` trên mỗi conductor.
7. Lịch trình (schedule) vẫn bị tạm dừng cho đến khi bạn tiếp tục nó (nhấp vào biểu tượng "Paused" ở tiêu đề).

Không cần chỉnh sửa thủ công hoặc khởi động lại khi tất cả các node đều trực tuyến.

### Khôi phục ngoại tuyến

Nếu một server hoặc conductor bị ngoại tuyến trong khoảng thời gian xoay vòng, bạn sẽ cần thực hiện hành động khôi phục thích hợp.

#### Xác thực lại một server worker ngoại tuyến

Nếu một server worker bỏ lỡ việc xoay vòng, bạn có thể khôi phục nó bằng cách lấy một token xác thực mới thủ công.

Những gì bạn cần:

- Secret key hiện tại từ conductor primary. Thông tin này chỉ có sẵn trên đĩa thông qua SSH vào conductor: `/opt/xyops/conf/overrides.json` (`secret_key`). Nó không thể lấy được qua API.
- ID dạng chữ-số của server ngoại tuyến (ví dụ: `smf4j79snhe`). Bạn có thể tìm thấy ID này trong UI trên trang lịch sử server, hoặc trên chính server đó trong `/opt/xyops/satellite/config.json`.

Tính toán SHA-256 của chuỗi kết hợp: `SERVER_ID + SECRET_KEY`, và sử dụng chuỗi hex digest làm token xác thực mới. Ví dụ:

```sh
## OpenSSL
printf "%s" "SERVER_IDSECRET_KEY" | openssl dgst -sha256 -r | awk '{print $1}'
```

Sau đó chỉnh sửa cấu hình satellite trên worker:

```
/opt/xyops/satellite/config.json
```

Đặt thuộc tính `auth_token` thành chuỗi SHA-256 hex vừa tính toán. Lưu file -- satellite sẽ tự động tải lại và cố gắng kết nối lại trong vòng ~30 giây. Kiểm tra log của satellite để khắc phục sự cố.

#### Cập nhật một conductor ngoại tuyến

If một conductor bị ngoại tuyến trong quá trình xoay vòng, hãy SSH vào nó và cập nhật key bằng tay:

1) Mở file `/opt/xyops/conf/overrides.json` trên conductor ngoại tuyến.
2) Đặt thuộc tính `secret_key` thành key mới từ conductor primary. If file thiếu `secret_key` (ví dụ: lần xoay vòng đầu tiên), hãy thêm nó.
3) Lưu file và khởi động lại dịch vụ conductor nếu cần.

Sau khi cập nhật, conductor sẽ gia nhập lại cluster với key chính xác.

### Thực hành tốt nhất

- Lên lịch xoay vòng trong một khoảng thời gian bảo trì để chấp nhận việc các job bị hủy bỏ.
- Xác nhận tình trạng sức khỏe của node trước để tránh các bước khôi phục thủ công.
- Lưu trữ key hiện tại một cách an toàn và hạn chế quyền truy cập SSH vào các conductor.
- Xoay vòng định kỳ như một phần của chương trình bảo mật của bạn (xem [Danh sách kiểm tra bảo mật](scaling.md#security-checklist)).
