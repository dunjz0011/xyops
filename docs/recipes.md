# Recipes

## Tổng Quan

Tài liệu này cung cấp một tập hợp các recipe hữu ích bạn có thể áp dụng trong PTOps.

## Continuous Jobs

Continuous job là job tự động chạy lại khi hoàn thành. Chức năng này giúp nâng cao hiệu quả và độ tin cậy khi thực thi job trong nhiều hệ thống khác nhau.  Để triển khai continuous job, làm theo các bước sau:

1. **Nối Dây Completion Action**: 
   - Thiết lập action kích hoạt lại cùng event khi job hoàn thành.
2. **Xử Lý Lỗi**:
   - Nếu job thất bại, triển khai một error handler riêng. Handler này có thể:
     - Thông báo cho bên chịu trách nhiệm về lỗi.
     - Khởi động lại job nếu cần.

### Quản Lý Job Thất Bại

Đối với các job gặp lỗi lặp lại nhiều lần, việc quản lý quy trình là rất cần thiết để tránh gián đoạn hệ thống. Xem xét các chiến lược sau:

- **Retry Limiter**: 
  - Thiết lập giới hạn tối đa cho số lần retry để tránh job chạy vô hạn.
- **Retry Delay**: 
  - Thêm khoảng chờ giữa các lần retry để có thời gian phục hồi hoặc khắc phục vấn đề gốc.

### Tổng Kết

Bằng cách áp dụng các hướng dẫn này, bạn có thể tạo một hệ thống continuous job vững chắc, có thể quản lý việc thực thi hiệu quả, xử lý lỗi một cách gọn gàng, và tránh ảnh hưởng xấu đến hiệu năng hệ thống. 

## Workflow Sao Lưu S3 Hàng Đêm

Sao lưu database và file lên Amazon S3 theo lịch cố định, kèm tuỳ chọn retention và thông báo.

### Cách Hoạt Động

- Trigger: Thêm trigger `schedule` vào lúc 01:00 theo timezone của bạn, và bật `catchup` để các lần chạy bị bỏ lỡ được chạy lại sau khi hệ thống gặp sự cố.
- Workflow: Dùng workflow để có thể multiplex job trên nhiều DB server.
  - Multiplex Controller: Gắn một job node để chạy trên một group server (ví dụ group "Database").
    - Dùng tuỳ chọn "stagger" để giãn cách job, hoặc dùng [Max Concurrent Jobs](limits.md#max-concurrent-jobs) và [Max Queue Limit](limits.md#max-queue-limit) để chạy tuần tự.
  - Job node 1: Shell Plugin để tạo backup trên mỗi DB server đích. 
    - Ví dụ: `pg_dump` hoặc `mysqldump`, cùng `tar` và `gzip` cho thư mục.
	- Thêm file vào output của job, ví dụ `echo '{"xy":1, "code":0, "files":["*.tgz"]}'`;
  - Job node 2, nối qua điều kiện "continue": Upload toàn bộ file input lên S3.
    - Nhắm đến server có kết nối mạng ra ngoài.
- Limits: Thêm limit [Max Run Time](limits.md#max-run-time) và [Max CPU Limit](limits.md#max-cpu-limit) vào job backup. Thêm limit [Max Concurrent Jobs](limits.md#max-concurrent-jobs) để tránh chạy chồng lặp.
- Thông báo: Thêm action [Web Hook](actions.md#web-hook) hoặc [Email](actions.md#email) khi `error` và `critical` kèm link đến job.

### Ghi Chú

- Dùng `params` và `fields` của event cho thông tin đăng nhập database, và dùng Secrets khi cần thiết.

## Pipeline Chuyển Mã Video

Chuyển mã video đầu vào sang MP4 H.264 và đẩy output lên storage và CDN. Hỗ trợ xử lý song song với phản hồi tiến độ.

### Cách Hoạt Động

- Điểm bắt đầu: Trigger manual cho các batch tuỳ ý, hoặc một trigger plugin tuỳ chỉnh theo dõi bucket S3 để phát hiện file mới.
- Đồ thị workflow:
  - Fetch: Job fetch tuỳ chọn khi bắt đầu để kéo file nguồn vào input của job (nối manual run tới node bắt đầu khác).
  - Split: Dùng Split controller trên `files` để mỗi sub-job nhận đúng một file input.
  - Job: Shell Plugin chạy `ffmpeg` với preset chuẩn, ghi output vào thư mục temp của job, và in tiến độ định kỳ. 
    - Ví dụ, bọc ffmpeg và xuất update `{ "xy": 1, "progress": N }` khi parse stderr của ffmpeg.
	- Thêm file vào output của job, ví dụ `{"xy":1, "code":0, "files":["*.mp4"]}`;
  - Continue: Sau khi tất cả item hoàn thành, tiếp tục sang bước đóng gói tạo manifest hoặc index.
  - Store: Trên node chuyển mã, gắn một action tuỳ chỉnh để upload output MP4 lên S3 hoặc storage khác.
- Limits: Gắn limit [Max CPU Limit](limits.md#max-cpu-limit), [Max Memory Limit](limits.md#max-memory-limit), [Max Run Time](limits.md#max-run-time), [Max Concurrent Jobs](limits.md#max-concurrent-jobs) và [Max Queue Limit](limits.md#max-queue-limit) vào node chuyển mã để kiểm soát sử dụng tài nguyên và độ sâu queue.
- Thông báo: Khi `success`, kích hoạt Web Hook đến endpoint xoá cache CDN. Khi `error`, gửi email hoặc post vào channel.

### Ghi Chú

- Nếu cần fan-out theo từng server, nhắm ffmpeg vào một group server thay vì một server đơn, và chọn thuật toán "Round Robin".
- Gắn tag `transcoded` cho job thành công và nối action `tag:transcoded` để kích hoạt việc publish ở bước sau.

## Số Liệu PostgreSQL

Thu thập số liệu health của PostgreSQL từ CLI và vẽ biểu đồ, kèm alert và tự động khắc phục.

### Cách Hoạt Động

- Monitor Plugin: Viết một Monitor Plugin đơn giản chạy `psql` và xuất một số liệu số mỗi phút. Nhắm expression của monitor vào output của plugin.
- Ví dụ truy vấn CLI trả về một số duy nhất:

```sh
# Số kết nối đang hoạt động trên một database cụ thể
psql -At -d mydb -c "select count(*) from pg_stat_activity where datname = 'mydb' and state = 'active'"

# Độ trễ replication (giây) trên standby
psql -At -d postgres -c "select extract(epoch from now() - pg_last_xact_replay_timestamp())::int"

# Ước tính backlog autovacuum (dead tuples)
psql -At -d mydb -c "select n_dead_tup from pg_stat_user_tables order by n_dead_tup desc limit 1"
```

- Trong cấu hình monitor:
  - Expression: tham chiếu đường dẫn output lệnh của plugin, ví dụ `commands.pg_active_conns`.
  - Data Match: nếu plugin trả về một dòng text, đặt regex như `(\d+)` để trích số.
  - Type: chọn `integer` hoặc `seconds` tuỳ theo loại số liệu.
- Alerts: Tạo alert kích hoạt khi vượt ngưỡng trong vài phút, ví dụ:
  - Số kết nối vượt 90% `max_connections` trong 5 phút.
  - Độ trễ replication vượt 60 giây trong 3 phút.
- Actions: Khi alert kích hoạt, chạy một event thu thập chẩn đoán pg, hoặc chạy `vacuumdb` trong khung giờ bảo trì.

### Ghi Chú

- Lưu thông tin đăng nhập database trong Secrets và bơm vào qua environment hoặc params; không hardcode.

## Alert Sức Khoẻ Web Service

Cảnh báo khi một web service cục bộ ngừng phản hồi trên cùng server với xySat. Recipe này dùng [Monitor Plugin](plugins.md#monitor-plugins) để chạy kiểm tra `curl` nhỏ mỗi phút, nhưng **không** tạo [Monitor](monitors.md) của PTOps. Monitor dùng để vẽ biểu đồ giá trị số theo thời gian. Ở đây ta chỉ cần một trạng thái chuỗi đơn giản, nên alert có thể khớp trực tiếp vào output thô của Plugin.

### Cách Hoạt Động

- Monitor Plugin: Tạo một Monitor Plugin chạy trên server hoặc group server chứa web service của bạn.
	- **Tiêu Đề Plugin**: Web Service Health
	- **Plugin ID**: Được tự động gán khi tạo
	- **Command**: `/bin/bash`
	- **Format**: `text`
	- **Script**:

```sh
URL="http://127.0.0.1:8080/health"

if curl --fail --silent --output /dev/null \
	--connect-timeout 5 \
	--max-time 5 \
	--retry 3 \
	--retry-delay 1 \
	--retry-all-errors \
	--retry-max-time 20 \
	"$URL"; then
	echo "UP"
else
	echo "DOWN"
fi
```

- Thay giá trị `URL` bằng health endpoint cục bộ của service bạn. Có thể là URL loopback như `http://127.0.0.1:8080/health`, hoặc bất kỳ URL nào có thể truy cập được từ server xySat.
	- Ví dụ dùng `127.0.0.1` thay vì `localhost` để tránh nhập nhằng khi tra hostname, đặc biệt trên hệ thống mà `localhost` có thể thử IPv6 (`::1`) trước IPv4.
- Cờ `--fail` báo cho `curl` coi các response lỗi HTTP như `404` hoặc `500` là thất bại thay vì download thành công.
- Cờ `--silent` và `--output /dev/null` giữ output Plugin gọn gàng, để PTOps chỉ nhận `UP` hoặc `DOWN`.
- Cờ `--connect-timeout 5` giới hạn thời gian `curl` chờ thiết lập kết nối.
- Cờ `--max-time 5` giới hạn thời gian tối đa cho mỗi lần thử request, tránh việc service không thể truy cập chiếm quá nhiều thời gian của lệnh xySat.
- Cờ `--retry 3` cho service thêm vài lần thử trong cùng một mẫu phút trước khi báo `DOWN`. Điều này giúp tránh kích hoạt do một gói tin bị rớt hoặc restart ngắn.
- Cờ `--retry-delay 1` chờ một giây giữa các lần retry.
- Cờ `--retry-all-errors` yêu cầu `curl` retry thêm nhiều loại lỗi, bao gồm lỗi kết nối và timeout.
- Cờ `--retry-max-time 20` giới hạn tổng thời gian retry, để Plugin không tốn quá nhiều thời gian trong phút đó để chờ.

Output thô từ Monitor Plugin được đặt vào [ServerMonitorData.commands](data.md#servermonitordata-commands), theo key là Plugin ID. Thay `YOUR_PLUGIN_ID` dưới đây bằng Plugin ID thực tế được PTOps gán. Dữ liệu server sẽ trông như sau:

```json
"commands": {
	"YOUR_PLUGIN_ID": "UP"
}
```

Khi service không thể truy cập, giá trị sẽ là:

```json
"commands": {
	"YOUR_PLUGIN_ID": "DOWN"
}
```

### Định Nghĩa Alert

Tạo một [Alert](alerts.md) mới và nhắm expression của nó vào output của Plugin:

```js
!match(commands.YOUR_PLUGIN_ID, "UP")
```

Hàm hỗ trợ `match()` là một phần của [PTOps Expression Format](xyexp.md#custom-functions). Expression này trả về true khi output thô của lệnh **không** chứa `UP`, vậy alert kích hoạt khi service down, hoặc khi Plugin không tạo được output healthy như mong đợi.

Gợi ý cấu hình alert:

- **Title**: Web Service Down
- **Expression**: `!match(commands.YOUR_PLUGIN_ID, "UP")`
- **Message**: `Web service health check failed.`
- **Samples**: `1`, để alert có thể kích hoạt ngay trong mẫu phút đó sau khi `curl` đã dùng hết số lần retry.
- **Server Groups**: Chọn group chứa web service, hoặc để trống nếu áp dụng cho tất cả.
- **Alert Actions**: Thêm action email, channel, ticket, web hook, snapshot, hoặc run-job khi cần.

### Tại Sao Không Tạo Monitor?

Recipe này chủ ý không tạo [Monitor](monitors.md) của PTOps. Monitor lưu và vẽ biểu đồ các giá trị số như CPU load, memory trống, số request, latency, hoặc dung lượng đĩa. Plugin này xuất ra một chuỗi trạng thái thay thế: `UP` hoặc `DOWN`.

Vì [alert](alerts.md#alert-expressions) đánh giá dựa trên dữ liệu monitoring hiện tại của server, chúng có thể đọc `commands.YOUR_PLUGIN_ID` trực tiếp. Điều này cho phép alert kích hoạt từ output text thô của Plugin mà không cần ép giá trị vào biểu đồ số.

### Ghi Chú

- Giữ output Plugin chỉ ở mức `UP` hoặc `DOWN`. Text thừa có thể làm expression alert khó suy luận hơn.
- Điều chỉnh giá trị timeout và retry cho service của bạn. Timeout ngắn hơn phát hiện lỗi nhanh hơn, còn nhiều retry hơn giúp tránh báo động giả khi restart ngắn hoặc trục trặc mạng. Nếu bạn đặt samples trên `1`, hãy nhớ mỗi sample thêm một phút nữa trước khi alert kích hoạt.
- Nếu service của bạn có health endpoint, dùng endpoint đó thay vì đường dẫn URI gốc. Một health endpoint chuyên dụng có thể kiểm tra kết nối database, cache, hoặc các dependency khác trước khi trả về thành công.
- Nếu bạn theo dõi nhiều service, tạo một Monitor Plugin cho mỗi service, hoặc xuất JSON từ một Plugin và khớp từng đường dẫn service riêng trong các alert khác nhau.

## Trigger Bình Minh và Hoàng Hôn

Chạy job vào lúc bình minh và hoàng hôn theo giờ địa phương, kèm offset tuỳ chọn. Hữu ích cho job năng lượng, điều khiển thiết bị IoT, hoặc dời các tác vụ nặng sang khung giờ thấp điểm.

### Cách Hoạt Động

- Trigger Plugin: Triển khai một scheduler plugin tính bình minh và hoàng hôn hôm nay cho một vĩ độ và kinh độ được cấu hình. Plugin chạy mỗi phút, so sánh giờ hiện tại theo timezone đã cấu hình, và báo kích hoạt khi trúng khung giờ.
  - Module gợi ý cho Node.js: [SunCalc](https://www.npmjs.com/package/suncalc)
- Parameters: `lat`, `lon`, `timezone`, `sunrise_offset_sec`, `sunset_offset_sec`, và bộ chọn tuỳ chọn `launch` là `sunrise` hoặc `sunset` hoặc `both`.
- Workflow: Nối node trigger plugin vào một workflow phân nhánh theo event nào kích hoạt. Ví dụ:
  - Lúc bình minh: chạy HTTP Request Plugin gọi API nhà thông minh để tắt đèn ngoài trời và mở rèm.
  - Lúc hoàng hôn: chạy bộ khởi động batch window tăng kích thước queue hoặc bắt đầu xử lý dữ liệu thấp điểm.
- Actions: Thêm Web Hook khi `start` và `success` để theo dõi.
- Limits: Thêm `max_concurrent` để tránh trùng lặp nếu khung giờ plugin trải qua nhiều phút.

### Ghi Chú

- Để tránh phụ thuộc vào API bên ngoài, nhúng phép tính bình minh/hoàng hôn ngay trong plugin. Dùng ngôn ngữ nào cũng được.
- Cung cấp một chế độ test tuỳ chọn để buộc kích hoạt nhằm kiểm tra toàn bộ đồ thị.

## Thông Báo Server Offline

Thông báo cho team khi bất kỳ server nào ngắt kết nối khỏi mạng PTOps. Recipe này dùng [System Hook](syshooks.md), chạy ngầm khi có hoạt động khớp được ghi log.

### Cách Hoạt Động

Thêm hook `server_remove` vào phần [hooks](config.md#hooks) trong `config.json`. Hoạt động này kích hoạt khi một server ngắt kết nối khỏi mạng. Xem [Activity.action](data.md#activity-action) để có danh sách đầy đủ ID hoạt động có thể kích hoạt System Hook.

Ví dụ web hook đơn giản:

```json
"hooks": {
	"server_remove": {
		"url": "https://alerts.mycompany.com/api/xyops-server-offline"
	}
}
```

Ví dụ email:

```json
"hooks": {
	"server_remove": {
		"email": "oncall-pager@mycompany.com"
	}
}
```

Bạn cũng có thể dùng một web hook ID đã cấu hình trong PTOps nếu muốn header tuỳ chỉnh, template nội dung request, hoặc các tuỳ chọn gửi khác:

```json
"hooks": {
	"server_remove": {
		"web_hook": "wmkd2yx4yw4ihh7lu"
	}
}
```

Để thông báo khi server quay lại online, hoặc khi có server mới thêm vào mạng, thêm hook `server_add`:

```json
"hooks": {
	"server_remove": {
		"email": "oncall-pager@mycompany.com"
	},
	"server_add": {
		"email": "oncall-pager@mycompany.com"
	}
}
```

### Ghi Chú

- Hoạt động `server_remove` kích hoạt bất cứ khi nào server ngắt kết nối, bao gồm nâng cấp có kế hoạch, restart dịch vụ, bảo trì mạng, và các trường hợp ngừng hoạt động dự kiến khác. Không phải lúc nào cũng có nghĩa là server bị crash.
- Hoạt động `server_add` kích hoạt bất cứ khi nào server kết nối vào mạng. Có nghĩa là một server offline trước đó đã quay lại, hoặc có server hoàn toàn mới được thêm vào.

## Giờ Tiết Kiệm Ánh Sáng Ngày (DST)

Chạy job an toàn trong khung giờ chuyển đổi Giờ Tiết Kiệm Ánh Sáng Ngày (DST) mà không trùng lặp hoặc bị bỏ lỡ.  Trong thời điểm chuyển DST, giờ đồng hồ địa phương nhảy giữa 1:00 và 3:00 sáng. Hai hiệu ứng xảy ra ở nhiều khu vực:

- Nhảy tới (Spring ahead): đồng hồ nhảy từ 1:59 lên 3:00 sáng. Khoảng thời gian giữa 2:00–2:59 sáng không tồn tại ngày đó.
- Lùi lại (Fall back): giờ từ 1:00–1:59 sáng lặp lại hai lần. Các thời điểm trong khung này xảy ra hai lần.

Cron Unix/Linux cổ điển dùng giờ địa phương và không loại trùng hoặc "chạy bù" quanh DST. Vào ngày nhảy tới, job lúc 2:30 bị bỏ lỡ. Vào ngày lùi lại, job lúc 1:30 chạy hai lần.

### Cách Hoạt Động

Dùng tính năng [Max Daily Limit](limits.md#max-daily-limit) để cho phép tối đa một lần hoàn thành job mỗi ngày lịch, sau đó lập lịch hai lần chạy mỗi ngày:

- Thêm Max Daily Limit vào event (hoặc workflow) với condition đặt là "Complete" và số lượng tối đa hàng ngày đặt là "1". Điều này lặng lẽ chặn bất kỳ lần chạy thứ hai sau khi đã có một job hoàn thành trong ngày đó. Xem [Action.condition](data.md#action-condition) để hiểu ý nghĩa các condition.
- Thêm hai trigger schedule (hoặc một trigger với nhiều giờ được chọn): một vào giờ mong muốn theo timezone của bạn, và một cái khác đúng +1 giờ sau đó.

Cách sắp xếp này xử lý được cả ba trường hợp:

- **Ngày bình thường**: job chạy vào giờ mong muốn; lần chạy +1 giờ bị chặn lặng lẽ bởi daily limit.
- **Nhảy tới**: giờ mong muốn có thể không tồn tại (ví dụ 2:30). Lần chạy +1 giờ tồn tại và thực thi; daily limit vẫn cho phép vì chưa có gì chạy trước đó.
- **Lùi lại**: giờ mong muốn xảy ra hai lần; lần xuất hiện đầu tiên chạy và hoàn thành, cả lần lặp lại và lần chạy +1 giờ đều bị chặn bởi daily limit.

Ghi chú: Lần chạy manual bỏ qua kiểm tra Max Daily Limit, đây là chủ ý thiết kế. Nếu bạn chạy lại job bằng tay vào ngày chuyển đổi, nó có thể vượt số lượng hàng ngày.

### Ví Dụ

Cấu hình event sau chạy vào 2:30 sáng giờ địa phương, với lần thử an toàn thứ hai vào 3:30 sáng, và cho phép tối đa một lần hoàn thành mỗi ngày.

- **Schedule Trigger**:
	- Hours: chọn `2` và `3`
	- Minutes: chọn `30`
	- Timezone: Đặt theo timezone của bạn

- **Max Daily Limit**:
	- Job Condition: "Complete"
	- Max Daily Amount: 1

Bạn có thể áp dụng cùng mẫu này cho [Workflows](workflows.md) vì workflow cũng hỗ trợ limit. Nếu muốn tập trung hoá giới hạn này, bạn cũng có thể định nghĩa nó như một category limit để nhiều event cùng kế thừa quy tắc một-lần-mỗi-ngày.
