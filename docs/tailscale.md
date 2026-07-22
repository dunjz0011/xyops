# Tailscale

## Tổng Quan

PTOps kết hợp tốt với [Tailscale](https://tailscale.com/) (cụ thể là [Tailscale Serve](https://tailscale.com/kb/1312/serve)), hoạt động như một hệ thống SSO bằng cách chuyển tiếp các header đáng tin cậy. Tài liệu này mô tả cách thiết lập PTOps trên Tailnet của bạn bằng CLI Tailscale Serve, và cả khi dùng làm "sidecar" với Docker Compose.

Trước tiên, hãy đọc [Hướng Dẫn SSO của PTOps](sso.md), vì tài liệu đó giới thiệu một số khái niệm mà chúng ta sẽ tham chiếu ở đây.

## Header Map

Đây là cách bạn nên cấu hình [SSO Header Map](sso.md#header-map) khi dùng Tailscale Serve:

```json
"header_map": {
	"username": "Tailscale-User-Login",
	"full_name": "Tailscale-User-Name",
	"email": "Tailscale-User-Login",
	"avatar": "Tailscale-User-Profile-Pic",
	"groups": "Tailscale-App-Capabilities"
}
```

Ngoài ra, bạn có thể chỉ cần bật SSO và đặt thuộc tính `preset` thành `tailscale`, thuộc tính này sẽ tự cấu hình header map (và một số thứ khác) cho bạn. Ví dụ dùng biến môi trường:

```sh
XYOPS_SSO__enabled="true"
XYOPS_SSO__preset="tailscale"
```

## Username

Hãy đọc phần [SSO Header Cleanup](sso.md#header-cleanup) về việc dọn dẹp username, để hiểu cách username Tailscale của bạn (được gửi vào dưới dạng địa chỉ email) sẽ được chuyển đổi ở phía PTOps. Theo mặc định, domain email sẽ bị loại bỏ, và username của bạn sẽ là phần đầu của địa chỉ email.

## Admin Bootstrap

Nếu bạn chỉ muốn nhanh chóng chạy được hệ thống, bạn có thể dùng tính năng [SSO Admin Bootstrap](sso.md#admin-bootstrap) để tự động nâng cấp bản thân thành administrator đầy đủ quyền. Lưu ý rằng tính năng này được thiết kế như một shortcut thiết lập một lần, và sẽ ghi một cảnh báo lớn vào activity log của PTOps mỗi lần đăng nhập.

## Capability

Tailscale có thể chuyển tiếp thứ họ gọi là "capability" (khả năng), có thể chuyển đổi thành role và privilege ở phía PTOps. Nói ngắn gọn, bạn có thể dùng capability grant của Tailscale để tự động gán privilege và/hoặc role phù hợp cho user PTOps của bạn. Đây là cách thiết lập:

1. Đăng nhập vào [Tailscale Admin Console](https://login.tailscale.com/welcome).
2. Nhấn tab "Access Controls".
3. Nhấn "JSON Editor".

Đầu tiên, tạo một tag mới tên `tag:xyops` và thêm vào phần `tagOwners`. Ví dụ:

```json
"tagOwners": {
	"tag:xyops": ["your-email@domain.com"]
}
```

Tiếp theo, tìm mảng `grants` trong JSON editor, hoặc tạo nó nếu cần. Thêm grant sau vào mảng:

```json
"grants": [
	{
		"src": ["autogroup:admin"],
		"dst": ["tag:xyops"],
		"app": {
			"xyops.io/cap/ts": [ {"privileges": ["admin"], "roles": []} ],
		}
	}
]
```

Điều này sẽ tự động nâng cấp bất kỳ ai trong group `autogroup:admin` của Tailscale thành administrator đầy đủ quyền của PTOps. Group `autogroup:admin` sẽ đã có sẵn trong tài khoản của bạn, vì nó được Tailscale tự động tạo. Bạn có thể xem tất cả group của mình, và cũng có thể thêm group mới, bằng cách nhấn tab "Visual Editor", rồi tab con "Groups".

Phần `app` trong JSON của grant rất quan trọng -- cú pháp phải chính xác:

```json
"app": {
	"xyops.io/cap/ts": [ {"privileges": ["admin"], "roles": []} ],
}
```

`xyops.io/cap/ts` là key duy nhất mà PTOps tìm kiếm khi phân tích các header đến. Nó phải được đặt chính xác là `xyops.io/cap/ts`, và giá trị phải là một mảng object, như minh hoạ trên. Các thuộc tính trong object được truyền trực tiếp cho PTOps:

- Mảng con `privileges` có thể chứa bất kỳ [PTOps Privilege ID](privileges.md) hợp lệ nào, ví dụ `admin`.
- Mảng con `roles` có thể chứa bất kỳ [PTOps Role ID](users.md#roles) hợp lệ nào, do người dùng tự tạo.

Lưu ý rằng theo mặc định, role và privilege được áp dụng "cộng thêm" (additive) vào bản ghi user. Nghĩa là, đồng bộ SSO sẽ không bao giờ *xoá* một role hoặc privilege. Điều này giúp bạn có thể tự áp dụng role và quyền cho user thông qua Admin UI của PTOps mà không bị xung đột. Tuy nhiên, nếu bạn không muốn hành vi này, và muốn Tailscale là nguồn thông tin duy nhất cho toàn bộ role và privilege của user, hãy đặt thuộc tính SSO [replace_roles](sso.md#configuration) và/hoặc [replace_privileges](sso.md#configuration) thành `true`. Những thuộc tính đó sẽ thay thế **toàn bộ** role và/hoặc privilege của user bằng bất cứ gì nhận được từ header capability của Tailscale. Việc đồng bộ này diễn ra mỗi lần user đăng nhập và làm mới session, xoá bỏ mọi thay đổi cục bộ đã thực hiện trong PTOps.

Nhớ nhấn nút "Save" khi bạn hoàn tất chỉnh sửa JSON trong Tailscale Admin Console.

## Base URL

PTOps cần biết base URL của ứng dụng đang host để có thể tạo các URL tự tham chiếu trong những thứ như email gửi ra và web hook. Để làm điều này, bạn cần đặt thuộc tính cấu hình [base_app_url](config.md#base_app_url) thành URL app do Tailscale cung cấp. Hostname sẽ là tên máy hiện tại, theo sau bởi domain Tailnet tuỳ chỉnh của bạn. Ví dụ:

```json
"base_app_url": "https://joemax.taild89302.ts.net"
```

Hoặc qua biến môi trường:

```sh
XYOPS_base_app_url="https://joemax.taild89302.ts.net"
```

Thêm vào đó, nếu bạn có kế hoạch thêm các satellite server ở xa, PTOps cần biết hostname nào để dùng khi tự quảng bá (advertise) với cluster của nó (tức là các satellite server sẽ kết nối lại với conductor chính bằng cách nào). Để làm điều này, thêm thuộc tính cấu hình cấp cao nhất `hostname` đặt thành Tailnet hostname của máy bạn:

```json
"hostname": "joemax.taild89302.ts.net"
```

Hoặc qua biến môi trường:

```sh
XYOPS_hostname="joemax.taild89302.ts.net"
```

Theo mặc định PTOps dùng hostname cục bộ của máy hiện tại cho việc này, nên ta muốn ghi đè để dùng Tailnet hostname đặc biệt của mình.

## HTTPS

Giả sử bạn đã bật [Tailscale HTTPS](https://login.tailscale.com/admin/dns) trên Tailnet của mình (rất khuyến nghị), điều này có nghĩa Tailscale Serve **chỉ** hỗ trợ URL HTTPS tới app của bạn. Vì vậy, ta cần đặt thêm vài thuộc tính cấu hình để bạn có thể thêm satellite server và cho chúng giao tiếp qua HTTPS:

- `satellite.config.secure`: `true`
- `satellite.config.port`: `443`

Hoặc qua biến môi trường:

```sh
XYOPS_satellite__config__secure="true"
XYOPS_satellite__config__port="443"
```

## Serve

Khi đã cấu hình và chạy PTOps với SSO được bật, khởi động [Tailscale Serve](https://tailscale.com/kb/1312/serve) bằng các đối số command-line này:

```sh
tailscale serve --accept-app-caps=xyops.io/cap/ts 5522
```

Đối số đặc biệt `--accept-app-caps=xyops.io/cap/ts` báo cho Tailscale chuyển tiếp header HTTP đặc biệt `Tailscale-App-Capabilities` với mọi request đến, mà PTOps dùng để áp dụng privilege và role cho user (xem [Capability](#capability) ở trên).

Trước khi thử tải app trong browser, vào [Machine List](https://login.tailscale.com/admin/machines) trong Tailscale Admin Console, và thêm tag `tag:xyops` cho máy đang host PTOps.

Lưu ý rằng lần đầu bạn truy cập URL HTTPS an toàn do Tailscale cung cấp cho app đang serve, có thể có một khoảng chờ ngắn khi Tailscale cấp phát chứng chỉ TLS. Nếu bạn nhận được lỗi timeout, hãy chờ vài giây và refresh lại. Đây là điều bình thường.

## Đăng Xuất

Khi user nhấn nút "Logout" trong PTOps UI, dữ liệu session và cookie của user sẽ bị xoá. Tuy nhiên, với một nhà cung cấp SSO như Tailscale ta không thể đăng xuất "hoàn toàn" user, vì họ vẫn đang kết nối và xác thực với Tailnet của họ, nên nếu họ chỉ điều hướng browser quay lại app, họ sẽ đăng nhập lại ngay lập tức (đây là chủ ý thiết kế).

Vì vậy, với SSO Tailscale cách tốt nhất để xử lý điều này là đặt [logout_url](sso.md#logging-out) thành giá trị sau, hiển thị một thông báo cho user giải thích tình huống "đăng xuất một phần":

```sh
XYOPS_SSO__logout_url="/api/app/sso_logout"
```

Lưu ý rằng nếu bạn dùng tính năng `preset` để bật Tailscale (xem trên), `logout_url` sẽ được đặt tự động cho bạn.

## Bảo Mật

Để tăng cường bảo mật, đặt [SSO IP Whitelist](sso.md#ip-whitelist) chỉ chấp nhận header đáng tin cậy từ localhost, vì đó là cách Tailscale Serve định tuyến traffic:

```json
"whitelist": ["127.0.0.1", "::1/128"]
```

Whitelist cũng có thể được chỉ định qua biến môi trường. Trong trường hợp đó chỉ cần dùng danh sách IP và/hoặc CIDR phân tách bằng dấu phẩy:

```sh
XYOPS_SSO__whitelist="127.0.0.1,::1/128"
```

Cuối cùng, nhớ **xoá tài khoản admin mặc định** mà PTOps tự động tạo khi cài đặt lần đầu. Vì bạn đang dùng SSO, tài khoản này về mặt kỹ thuật là "không thể truy cập", nhưng xoá nó là an toàn nhất vì nó có mật khẩu không an toàn theo mặc định.

## Sidecar

Tailscale có một tính năng rất hay cho phép PTOps chạy trong container Docker như một "node" riêng trên Tailnet của bạn. Điều này được thực hiện bằng cách chạy Tailscale như một [sidecar container](https://tailscale.com/blog/docker-tailscale-guide) cùng với container PTOps. Tailscale sau đó xử lý mọi thứ bao gồm DNS, TLS, và proxy request tới PTOps, bao gồm chuyển tiếp header đáng tin cậy để tự động đăng nhập và gán privilege/role. Hướng dẫn này chứa mọi thứ bạn cần để khởi động và chạy.

### Thiết Lập Tailscale Admin

Điều đầu tiên bạn cần làm là đăng nhập vào [Tailscale Admin Console](https://login.tailscale.com/welcome), rồi:

1. Đọc phần [Capability](#capability) ở trên, để thêm grant vào tệp chính sách Tailnet của bạn, để PTOps có thể tự động gán privilege và role cho user.
2. Tạo một Auth Key. Xem [Generate An Auth Key](https://tailscale.com/kb/1085/auth-keys#generate-an-auth-key) để biết hướng dẫn.

Nhớ rằng auth key mặc định sẽ hết hạn. Xem [Tailscale Key Expiry](https://tailscale.com/docs/features/access-control/auth-keys#key-expiry) để biết thêm. Để có quyền truy cập vĩnh viễn, bạn có thể tắt việc hết hạn key, và thêm tag cho máy.

### Thiết Lập Host

Đảm bảo bạn đã cài đặt và chạy [Docker](https://www.docker.com/) cùng với Docker CLI và Docker Compose.

Tạo một thư mục trên máy host để PTOps sử dụng, và `cd` vào đó. Nó chỉ cần lưu vài tệp cấu hình và một số thư mục ánh xạ volume cho các container.

### Env File

Tạo tệp `.env` trong thư mục host của chúng ta với nội dung sau:

```sh
# Cấu hình Tailscale
TS_AUTHKEY="YOUR_TAILSCALE_AUTHKEY"
TS_HOST="xyops.taild89302.ts.net"
TZ="America/Los_Angeles"
```

- Đổi giá trị `TS_AUTHKEY` thành auth key của bạn vừa tạo trên Tailscale console.
- Đổi giá trị `TS_HOST` thành domain Tailnet của riêng bạn, giữ lại tiền tố `xyops.`. Xem tab [DNS](https://login.tailscale.com/admin/dns) trong Tailscale Admin Console.
- Đổi `TZ` thành timezone cục bộ của bạn, để PTOps có thể xoay log và reset thống kê hàng ngày vào "nửa đêm của bạn".

### Docker Compose

Tạo tệp `compose.yaml` trong thư mục host của chúng ta với nội dung sau:

```yaml
configs:
  ts-serve:
    content: |
      {"TCP":{"443":{"HTTPS":true}},
      "Web":{"$${TS_CERT_DOMAIN}:443":
          {"Handlers":{"/":
          {"Proxy":"http://127.0.0.1:5522","AcceptAppCaps":["xyops.io/cap/ts"]}}}},
      "AllowFunnel":{"$${TS_CERT_DOMAIN}:443":false}}

services:
  # Cấu hình Tailscale Sidecar
  tailscale:
    image: tailscale/tailscale:latest
    container_name: tailscale-xyops # Tên để quản lý container cục bộ
    hostname: xyops # Tên dùng trong môi trường Tailscale của bạn
    environment:
      TS_AUTHKEY: "${TS_AUTHKEY}"
      TS_STATE_DIR: "/var/lib/tailscale"
      TS_SERVE_CONFIG: "/config/serve.json"
      TS_USERSPACE: "false"
      TS_ENABLE_HEALTH_CHECK: "true" # Bật endpoint healthcheck: "/healthz"
      TS_LOCAL_ADDR_PORT: "127.0.0.1:41234" # <addr>:<port> cho endpoint healthz
      TS_ACCEPT_DNS: "true" # Dùng Tailscale MagicDNS
      TS_AUTH_ONCE: "true"
    configs:
      - source: ts-serve
        target: /config/serve.json
    volumes:
      - ./ts-config:/config # Thư mục config dùng để lưu file Tailscale
      - ./ts-state:/var/lib/tailscale # Yêu cầu bắt buộc của Tailscale
    devices:
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - net_admin
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1:41234/healthz"]
      interval: 1m
      timeout: 10s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  xyops01:
    image: ghcr.io/pixlcore/xyops:latest
    container_name: xyops01
    network_mode: service:tailscale # Dùng Sidecar
    init: true
    restart: unless-stopped
    environment:
      XYOPS_xysat_local: "true"
      XYOPS_hostname: "${TS_HOST}"
      XYOPS_masters: "${TS_HOST}"
      XYOPS_base_app_url: "https://${TS_HOST}"
      XYOPS_satellite__config__secure: "true"
      XYOPS_satellite__config__port: "443"
      XYOPS_SSO__enabled: "true"
      XYOPS_SSO__preset: "tailscale"
      XYOPS_SSO__whitelist: "127.0.0.1,::1/128"
      TZ: "${TZ}"
    volumes:
      - xy-data:/opt/xyops/data
      - ./xyops01-conf:/opt/xyops/conf
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      tailscale:
        condition: service_healthy

volumes:
  xy-data:
```

Bạn không cần chỉnh sửa gì trong tệp `compose.yaml`, nhưng đây là vài lưu ý:

- Biến môi trường `XYOPS_xysat_local` khiến PTOps khởi chạy [xySat](hosting.md#satellite) ở background, trong cùng container. Điều này giúp bạn có thể chạy job ngay -- rất tốt cho việc test và home lab, nhưng *không khuyến nghị cho production*.
- Việc bind `/var/run/docker.sock` là tuỳ chọn, và cho phép PTOps tự khởi chạy container của nó (ví dụ cho [Docker Plugin](plugins.md#docker-plugin), và [Plugin Marketplace](marketplace.md)).

### Khởi Động

Nhập lệnh sau để khởi động toàn bộ (switch `-d` chạy nó ở background):

```sh
docker compose up -d
```

Trước khi thử tải app trong browser, vào [Machine List](https://login.tailscale.com/admin/machines) trong Tailscale Admin Console, và thêm tag `tag:xyops` cho máy mới. Bạn cũng có thể tắt việc hết hạn ở đây.

Cuối cùng, truy cập URL `TS_HOST` của bạn trong browser yêu thích. Ví dụ:

https://xyops.taild89302.ts.net/

Lưu ý rằng lần đầu bạn truy cập URL, có thể có một khoảng chờ ngắn khi Tailscale cấp phát chứng chỉ TLS.
