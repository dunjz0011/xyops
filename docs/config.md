# Cấu hình

## Tổng quan

PTOps được cấu hình chủ yếu thông qua một file JSON duy nhất nằm ở: `/opt/xyops/conf/config.json` (vị trí có thể thay đổi đối với các bản cài đặt tùy chỉnh).

Tuy nhiên, nếu cấu hình được sửa đổi bằng UI, các giá trị ghi đè sẽ được lưu trong một file riêng biệt: `/opt/xyops/conf/overrides.json`

Tài liệu này mô tả tất cả các thuộc tính có thể chỉnh sửa trong file `config.json`.

<!-- Group: Global Settings -->

## base_app_url
<!-- Title: URL ứng dụng cơ sở -->

Chuỗi này là URL cơ sở của instance PTOps của bạn (mặc định: `http://localhost:5522`), và được sử dụng để xây dựng các liên kết đầy đủ trong email, alert, ticket và webhook (ví dụ: URL của job/ticket và URL logo trong email).

## secret_key

Chuỗi này là một secret chung được sử dụng để ký các token (ví dụ: liên kết tải xuống), xác thực các thông điệp đa conductor, và mã hóa/giải mã các secret được lưu trữ -- hãy đặt giá trị này thành một chuỗi ngẫu nhiên dài trong môi trường production.

## temp_dir
<!-- Title: Đường dẫn thư mục tạm -->

Chuỗi này là thư mục nháp cho các file tạm thời như các plugin bundle và các file upload đang chuẩn bị (mặc định: `temp`).

Nếu đây là một đường dẫn tương đối, nó sẽ được tính từ thư mục gốc của PTOps, thông thường là `/opt/xyops`.

## pid_file
<!-- Title: Đường dẫn file PID -->

Chuỗi này thiết lập đường dẫn đến file PID của tiến trình chính để phục vụ các công cụ start/stop (mặc định: `logs/xyops.pid`).

Nếu đây là một đường dẫn tương đối, nó sẽ được tính từ thư mục gốc của PTOps, thông thường là `/opt/xyops`.

## debug_level
<!-- Title: Cấp độ log debug -->

Số này thiết lập mức độ chi tiết cho logger (mặc định: `5`; 1 = im lặng, 10 = rất chi tiết).

## tick_precision_ms
<!-- Title: Độ chính xác Tick (ms) -->

Số này thiết lập độ chính xác của bộ hẹn giờ nội bộ tính bằng mili giây được sử dụng bởi server framework để lập lịch cho các tick (mặc định: `50`).

Điều này kiểm soát độ chính xác của PTOps khi thực thi các action được nhắm mục tiêu vào một giây cụ thể. Giá trị thấp hơn có nghĩa là PTOps chính xác hơn, nhưng sẽ dẫn đến việc sử dụng CPU lúc rảnh rỗi cao hơn.

## maintenance
<!-- Title: Lịch bảo trì (HH:MM) -->

Chuỗi này (ở định dạng `HH:MM`, theo giờ địa phương của server) lập lịch cho các tác vụ bảo trì hàng ngày như dọn dẹp DB và lưu trữ log (mặc định: `04:00`).

## ttl
<!-- Title: API Time-to-Live (giây) -->

Số này (tính bằng giây) là TTL bộ nhớ đệm HTTP mặc định được áp dụng cho các phản hồi API được chọn và các tài nguyên tĩnh nếu có (mặc định: `300`).

## file_expiration
<!-- Title: Hết hạn file -->

Chuỗi khoảng thời gian này thiết lập thời gian hết hạn mặc định cho các file được tải lên (ví dụ: file đính kèm ticket), được sử dụng để tính toán dấu thời gian hết hạn cho mỗi file (mặc định: `5 years`).

## timeline_expiration
<!-- Title: Hết hạn Timeline -->

Chuỗi khoảng thời gian này thiết lập thời gian lưu giữ cho các timeline monitor; các điểm dữ liệu cũ hơn sẽ bị cắt tỉa trong quá trình bảo trì (mặc định: `10 years`).

## ping_freq_sec
<!-- Title: Tần suất Ping WebSocket (giây) -->

Số này (tính bằng giây) kiểm soát khoảng thời gian gửi ping WebSocket tới các client/worker (mặc định: `5`).

## ping_timeout_sec
<!-- Title: Timeout WebSocket (giây) -->

Số này (tính bằng giây) là thời gian tối đa cho phép mà không nhận được pong trước khi một socket bị coi là quá thời gian chờ (timeout) (mặc định: `30`).

## max_jobs_per_min
<!-- Title: Số job tối đa mỗi phút -->

Số này thiết lập giới hạn tỷ lệ toàn cục đối với số job bắt đầu mỗi phút (mặc định: `100`); các job vượt quá giới hạn sẽ bị ngăn không cho khởi chạy.

Lớp này được thiết kế như một cơ chế phanh khẩn cấp để ngăn chặn cấu hình workflow bị lỗi làm sập toàn bộ hệ thống.

## max_jobs_per_workflow
<!-- Title: Số job tối đa mỗi workflow -->

Số này thiết lập giới hạn toàn cục cho số lượng sub-job tối đa được phép trên mỗi lượt chạy workflow (mặc định: `1000`). Các job bổ sung sẽ bị ngăn chặn khởi chạy, và workflow sẽ bị hủy bỏ (abort).

## dead_job_timeout
<!-- Title: Timeout job chết (giây) -->

Số này (tính bằng giây) xác định thời điểm một job đang chạy không có cập nhật được coi là đã chết và bị hủy bỏ (mặc định: `120`).

## stale_alert_timeout
<!-- Title: Timeout alert cũ (giây) -->

Số này (tính bằng giây) xác định thời điểm các alert cũ bị xóa sạch. Alert cũ xảy ra khi một server ngắt kết nối với các alert đang hoạt động được đính kèm.

## default_plugin_credentials
<!-- Title: Credential mặc định của Plugin -->

Object này cho phép bạn thiết lập các giá trị UID và/hoặc GID mặc định cho mỗi loại Plugin. UID/GID có thể là ID dạng số hoặc các chuỗi username (`root`, `admin`, v.v.). Chỉ hỗ trợ Linux/macOS.

## job_env
<!-- Title: Biến môi trường của Job -->

Object này chứa các biến môi trường được gộp vào mọi tiến trình job.

Các giá trị có thể được ghi đè trên mỗi job.

## job_universal_limits
<!-- Title: Giới hạn phổ quát của Job -->

Object này định nghĩa các quy tắc giới hạn toàn cục được áp dụng tự động cho tất cả các job/workflow, chẳng hạn như giới hạn độ đồng thời, hàng đợi hoặc số lần thử lại tối đa.

## job_universal_actions
<!-- Title: Action phổ quát của Job -->

Object này định nghĩa các action toàn cục được thực thi khi đáp ứng các điều kiện (mặc định bao gồm việc chụp snapshot hệ thống khi có lỗi). Các action có thể được chỉ định theo loại job (workflow hoặc event).

Ví dụ:

```json
"job_universal_actions": {
	"default": [
		{
			"enabled": true,
			"hidden": false,
			"condition": "error",
			"type": "snapshot"
		}
	],
	"workflow": []
}
```

## alert_universal_actions
<!-- Title: Action phổ quát của Alert -->

Mảng này liệt kê các action tự động áp dụng cho tất cả các alert để có hành vi chuẩn hóa (mặc định bao gồm một snapshot ẩn khi có alert mới).

Ví dụ:

```json
"alert_universal_actions": [
	{
		"enabled": true,
		"hidden": true,
		"condition": "alert_new",
		"type": "snapshot"
	}
]
```

## hostname_display_strip
<!-- Title: Lọc hiển thị hostname của Server -->

Chuỗi regex này được loại bỏ khỏi phần cuối của các hostname để hiển thị và thông báo (mặc định: `\\.[\\w\\-]+\\.\\w+$`), ví dụ: để cắt bỏ hậu tố domain.

## ip_display_strip
<!-- Title: Lọc hiển thị địa chỉ IP -->

Chuỗi regex này được loại bỏ khỏi các địa chỉ IP để hiển thị (mặc định: `^::ffff:`), ví dụ: để cắt bỏ tiền tố IPv6 được ánh xạ từ IPv4.

## search_file_threads
<!-- Title: Thread tìm kiếm file -->

Số này thiết lập số lượng worker thread được sử dụng khi tìm kiếm các file trên đĩa (mặc định: `1`).

## search_file_regex
<!-- Title: Regex tìm kiếm file -->

Chuỗi regex này giới hạn tên file nào được quét bởi các API tìm kiếm file (mặc định: `\\.(txt|log|csv|tsv|xml|json)(\\.gz)?$`).

## quick_monitors
<!-- Title: Quick Monitor -->

Mảng này xác định các metric tích hợp sẵn cần thu thập (mặc định bao gồm cấu hình sẵn cho CPU, bộ nhớ, đĩa và mạng). Các thông số này được hiển thị trên các trang chi tiết server để giám sát thời gian thực.

<!-- Group: Email Settings -->

## email_from
<!-- Title: Email gửi từ -->

Chuỗi này là địa chỉ email người gửi cho tất cả các thông điệp gửi đi (mặc định: `admin@localhost`); nhiều server SMTP yêu cầu đây phải là một địa chỉ hợp lệ.

## mail_settings
<!-- Title: Cấu hình bộ gửi mail -->

Object này cấu hình trình vận chuyển email và được truyền nguyên bản tới [Nodemailer](https://nodemailer.com/).

Cấu hình mặc định là:

```json
{
	"host": "localhost",
	"port": 25,
	"auth": { "user": "", "pass": "" }
}
```

Xem [Nodemailer - SMTP](https://nodemailer.com/smtp/) và [Nodemailer - Sendmail](https://nodemailer.com/transports/sendmail/) để biết đầy đủ các tùy chọn.

Ví dụ (SMTP cơ bản trên localhost):

```json
"mail_settings": {
	"host": "localhost",
	"port": 25
}
```

Ví dụ (sendmail cục bộ):

```json
"mail_settings": {
	"sendmail": true,
	"newline": "unix",
	"path": "/usr/sbin/sendmail"
}
```

Ví dụ (Fastmail):

```json
"mail_settings": {
	"host": "smtp.fastmail.com",
	"port": 465,
	"auth": { "user": "youremail@fastmail.com", "pass": "YOUR_PASSWORD" },
	"secure": true
}
```

## email_format
<!-- Title: Định dạng Email -->
<!-- Type: Menu -->
<!-- Items: ["html", "text"] -->

Chuỗi này kiểm soát định dạng nội dung email (mặc định: `html`). Sử dụng `html` cho email có kiểu dáng hoặc `text` cho văn bản thuần túy.

## email_logo
<!-- Title: Logo Email -->
<!-- Type: Menu -->
<!-- Items: ["link", "inline", "none"] -->

Cấu hình này kiểm soát hình ảnh logo email (mặc định: `inline`). Sử dụng `inline` để chèn logo dưới dạng file đính kèm nội tuyến, `link` để liên kết trực tiếp đến URL hình ảnh logo, hoặc `none` để ẩn hoàn toàn hình ảnh logo.

Khi tùy chọn này được đặt thành `inline`, [client.logo_url](#client-logo_url) phải là một đường dẫn web root cục bộ dưới thư mục `htdocs` của PTOps, vì PTOps tải hình ảnh từ đĩa trước khi đính kèm vào email gửi đi. Khi đặt thành `link`, `client.logo_url` có thể là một URL hình ảnh liên kết thông thường.

## max_emails_per_day
<!-- Title: Số email tối đa mỗi ngày -->

Số này giới hạn tổng số email được gửi mỗi ngày trên toàn bộ ứng dụng (mặc định: 0, nghĩa là không giới hạn); các lượt gửi vượt quá sẽ bị từ chối với một lỗi.

<!-- Group: Logging Settings -->

## log_dir
<!-- Title: Đường dẫn thư mục Log -->

Chuỗi này thiết lập thư mục cơ sở cho các log server và log job (mặc định: `logs`), ví dụ: `logs/Error.log` và `logs/jobs/ID.log`.

Nếu đây là một đường dẫn tương đối, nó sẽ được tính từ thư mục gốc của PTOps, thông thường là `/opt/xyops`.

## log_filename
<!-- Title: Template tên file Log -->

Chuỗi này là pattern tên file được sử dụng bởi core logger (mặc định: `[component].log`); hỗ trợ các placeholder cột log như `[component]`.

## log_columns
<!-- Title: Danh sách cột Log -->

Mảng các chuỗi này kiểm soát cột log nào được ghi và thứ tự của chúng.

Mặc định:

```json
["hires_epoch", "date", "hostname", "pid", "component", "category", "code", "msg", "data"]
```

Xem [pixl-logger](https://github.com/jhuckaby/pixl-logger) để biết thêm chi tiết.

## log_archive_path
<!-- Title: Đường dẫn lưu trữ Log -->

Chuỗi này thiết lập pattern đường dẫn lưu trữ log hàng đêm (mặc định: `logs/archives/[yyyy]/[mm]/[dd]/[filename]-[yyyy]-[mm]-[dd].log.gz`); quá trình bảo trì sẽ gzip và ghi log tại đây.

Chấp nhận các [placeholder ngày/giờ](https://github.com/jhuckaby/pixl-tools#getdateargs) để tạo động các tên file lưu trữ log.

## log_archive_keep
<!-- Title: Thời gian giữ lưu trữ Log -->

Chuỗi này chỉ định thời gian giữ các bản lưu trữ log, ví dụ: `30 days`.

Các bản lưu trữ log cũ hơn được tìm thấy trong [log_archive_path](#log_archive_path) sẽ tự động bị xóa sau khi log hàng đêm được xoay vòng.

Đặt giá trị này thành chuỗi trống để tắt tính năng và giữ các bản lưu trữ log vô thời hạn.

## log_archive_storage
<!-- Title: Lưu trữ Log vào bộ lưu trữ -->

Tùy chọn lưu trữ log vào bộ lưu trữ thay vì đĩa cục bộ. Tính năng này chủ yếu được thiết kế cho các engine lưu trữ của bên thứ 3 như S3. Để sử dụng tính năng này, trước tiên hãy *tắt* [log_archive_path](#log_archive_path) (đặt thành chuỗi trống), sau đó thiết lập thuộc tính này tương ứng.

Ví dụ:

```json
"log_archive_storage": {
	"enabled": true,
	"key_template": "logs/archives/[yyyy]/[mm]/[dd]/[filename]-[yyyy]-[mm]-[dd].log.gz",
	"expiration": "1 year"
}
```

## log_crashes
<!-- Title: Ghi log Crash -->

Giá trị boolean này cho phép ghi lại các ngoại lệ không được bắt và các lỗi crash trong hệ thống con logger (mặc định: `true`).

Vị trí log crash sẽ là: `/opt/xyops/logs/crash.log`

## tickets
<!-- Title: Cấu hình Ticket -->
<!-- Type: Group -->

Phần này cấu hình hệ thống con ticket.

### tickets.email_enabled
<!-- Title: Bật Email -->

Giá trị boolean này bật các email gửi đi liên quan đến ticket như thông báo mới/quá hạn (mặc định: `true`).

### tickets.email_debounce_sec
<!-- Title: Debounce Email (Giây) -->

Số này (tính bằng giây) thiết lập khoảng cách tối thiểu giữa các email cập nhật ticket lặp lại để giảm nhiễu thông tin (mặc định: `30`).

Ví dụ, nếu một user thực hiện một loạt các thay đổi liên tiếp đối với một ticket, chỉ một email sẽ được gửi trong khoảng thời gian 30 giây, chứa bản tóm tắt tất cả các thay đổi tích lũy.

### tickets.overdue_schedule
<!-- Title: Lịch kiểm tra quá hạn (HH:MM) -->

Chuỗi này (`HH:MM`) thiết lập thời gian hàng ngày khi hệ thống quét các ticket quá hạn và gửi thông báo (mặc định: `04:30`).

### tickets.overdue_query
<!-- Title: Truy vấn quá hạn -->

Chuỗi này là [truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) được sử dụng để chọn các ticket quá hạn trong quá trình quét theo lịch trình (mặc định: `status:open due:<today`).

### tickets.due_date_format
<!-- Title: Định dạng ngày hết hạn -->

Chuỗi định dạng ngày này kiểm soát cách hiển thị ngày hết hạn của ticket (mặc định: `[dddd], [mmmm] [mday], [yyyy]`).

### tickets.date_time_format
<!-- Title: Định dạng Ngày/Giờ -->

Chuỗi định dạng ngày/giờ này kiểm soát cách hiển thị dấu thời gian của ticket (mặc định: `[dddd], [mmmm] [mday], [yyyy] [hour12]:[mi] [ampm]`).

<!-- Group: Hook Settings -->

## hooks
<!-- Title: Hook hệ thống -->

Object này định nghĩa các trigger hook trên toàn hệ thống có thể kích hoạt trên bất kỳ hoạt động nào được ghi lại.

Ví dụ:

```json
{ "job_complete": { "web_hook": "wmhv3s16ymk" } }
```

Xem [Hook hệ thống](syshooks.md) để biết thêm chi tiết.

## hook_text_templates
<!-- Title: Template văn bản của Hook -->

Object này cung cấp các template tin nhắn cho các job và alert; các placeholder kiểu Mustache sẽ điền văn bản dễ đọc cho email và webhook (mặc định bao gồm các template như `{{links.job_details}}`).

Ví dụ:

```json
{
  "job_start": "Job started on {{nice_server}}: {{event.title}}: {{links.job_details}}",
  "job_success": "Job completed successfully on {{nice_server}}: {{event.title}}: {{links.job_details}}",
  "job_error": "Job failed on {{nice_server}}: {{event.title}}: Error ({{job.code}}): {{job.description}}: {{links.job_details}}",
  "job_progress": "Job is in progress on {{nice_server}} ({{event.title}}): {{links.job_details}}",
  "job_suspended": "Job is suspended and requires human intervention: {{event.title}}: {{links.job_details}}&resume=1",
  "job_limited": "{{action.msg}}: {{links.job_details}}",
  "alert_new": "Alert: {{nice_server}}: {{def.title}}: {{alert.message}}: {{links.alert_url}}",
  "alert_cleared": "Alert Cleared: {{nice_server}}: {{def.title}}"
}
```

Xem [JobHookData](data.md#jobhookdata) và [AlertHookData](data.md#alerthookdata) để biết danh sách các macro placeholder bạn có thể sử dụng ở đây.
## multi
<!-- Title: Cấu hình đa Conductor -->
<!-- Type: Group -->

Phần này cấu hình hệ thống con đa server.

### multi.enable_version_checks
<!-- Title: Bật kiểm tra phiên bản -->

Khi được đặt thành `true`, PTOps sẽ kiểm tra các bản cập nhật phiên bản của ứng dụng cốt lõi, việc này sẽ tạo ra các yêu cầu web bên ngoài tới URL Release Metadata.

### multi.list_url
<!-- Title: URL metadata bản phát hành -->

Chuỗi URL này trỏ đến siêu dữ liệu (metadata) của bản phát hành được sử dụng bởi các luồng nâng cấp đa conductor (mặc định: `https://api.github.com/repos/pixlcore/xyops/releases`).

### multi.protocol
<!-- Title: Giao thức WebSocket -->
<!-- Type: Menu -->
<!-- Items: ["ws:", "wss:"] -->

Chuỗi này chọn giao thức WebSocket cho truyền thông giữa các peer (mặc định: `ws:`); đặt thành `wss:` để yêu cầu TLS.

### multi.connect_timeout_sec
<!-- Title: Timeout kết nối (giây) -->

Số này (tính bằng giây) thiết lập thời gian chờ kết nối cho các kết nối socket peer ban đầu (mặc định: `3`).

### multi.master_timeout_sec
<!-- Title: Timeout Master (giây) -->

Số này (tính bằng giây) được sử dụng cho bộ hẹn giờ bầu cử và thời gian chờ kiểm soát chung cho các hoạt động của conductor (mặc định: `10`).

### multi.socket_opts
<!-- Title: Tùy chọn WebSocket -->

Object này giữ các tùy chọn được gộp vào WebSocket client, ví dụ: các tùy chọn TLS cho chứng chỉ tự ký.

Mặc định:

```json
{ "rejectUnauthorized": false }
```



## satellite
<!-- Title: Cấu hình PTOps Satellite -->
<!-- Type: Group -->

Phần này cấu hình xySat, agent satellite từ xa của chúng tôi.

### satellite.enable_version_checks
<!-- Title: Bật kiểm tra phiên bản -->

Khi được đặt thành `true`, PTOps sẽ kiểm tra các bản cập nhật phiên bản của ứng dụng xySat, việc này sẽ thực hiện các yêu cầu web bên ngoài tới URL Release Metadata.

### satellite.list_url
<!-- Title: URL metadata bản phát hành -->

Chuỗi URL này trỏ đến siêu dữ liệu (metadata) của bản phát hành cho agent satellite (mặc định: `https://api.github.com/repos/pixlcore/xysat/releases`).

### satellite.base_url
<!-- Title: URL cơ sở bản phát hành -->

Chuỗi URL này là URL cơ sở để tải xuống/nâng cấp satellite (mặc định: `https://github.com/pixlcore/xysat/releases`).

### satellite.image
<!-- Title: Docker Image của xySat -->

Đây là image Docker để sử dụng khi thêm các server satellite dựa trên Docker thông qua UI (mặc định: `ghcr.io/pixlcore/xysat`).

### satellite.version
<!-- Title: Phiên bản xySat -->

Chuỗi này thiết lập phiên bản satellite mong muốn cần lấy; có thể là một chuỗi semver hoặc một tag (mặc định: `latest`).

### satellite.cache_ttl
<!-- Title: TTL cache (giây) -->

Số này (tính bằng giây) thiết lập TTL bộ nhớ cache cho siêu dữ liệu bản phát hành satellite và các file tarball để giảm số lượng cuộc gọi mạng (mặc định: `3600`).

### satellite.config
<!-- Title: Cấu hình xySat -->

Object này chứa các cài đặt web server và runtime cho xySat; các tùy chọn này được truyền đi khi quản lý hoặc cấp phát các node satellite (các giá trị mặc định được cung cấp trong config mẫu).



## marketplace
<!-- Title: PTOps Marketplace -->
<!-- Type: Group -->

Phần này cấu hình PTOps Marketplace.

### marketplace.enabled
<!-- Title: Bật Marketplace -->

Giá trị boolean này bật hoặc tắt marketplace. Nếu bị tắt, user không thể tìm kiếm hoặc cài đặt plugin. Mặc định là `true` (được bật).

### marketplace.metadata_url
<!-- Title: URL Metadata -->

Chuỗi này trỏ đến vị trí siêu dữ liệu (metadata) của marketplace trung tâm, nơi chứa toàn bộ danh mục sản phẩm.

Ví dụ:

```
https://raw.githubusercontent.com/pixlcore/xyops-marketplace/refs/heads/main/marketplace.json
```

### marketplace.repo_url_template
<!-- Title: Template URL Repository của Plugin -->

Chuỗi này là một template được sử dụng để tạo các URL repository của plugin trỏ đến các file cụ thể. Nó có các macro placeholder cho `id` (org và repo), `version` (git tag) và `filename`.

Ví dụ:

```
https://raw.githubusercontent.com/[id]/refs/tags/[version]/[filename]
```

### marketplace.ttl
<!-- Title: Time-to-Live (giây) -->

Đây là số giây để lưu trữ cục bộ siêu dữ liệu của marketplace trước khi tìm nạp lại từ nguồn. Mặc định là `3600` (một giờ).



<!-- Group: Default User Settings -->

## default_user_privileges
<!-- Title: Privilege mặc định của User -->

Object này thiết lập các privilege mặc định cho user mới (mặc định bao gồm tạo/sửa event, chạy/tag/bình luận job, và các quyền đối với ticket) trừ khi bị ghi đè bởi role hoặc SSO.

Xem [Privilege](privileges.md) để biết thêm chi tiết về các đặc quyền.

## default_user_prefs
<!-- Title: Tùy chọn mặc định của User -->

Object này thiết lập các tùy chọn UI mặc định cho user mới (locale, theme, chuyển động/độ tương phản, âm lượng, các tìm kiếm đã lưu, v.v.), được gộp vào profile khi tạo/đăng nhập.

Xem [User](data.md#user) để biết chi tiết về các thuộc tính có thể được chỉ định ở đây.



## db_maint
<!-- Title: Bảo trì cơ sở dữ liệu -->
<!-- Type: Group -->

Các thiết lập này được sử dụng trong quá trình bảo trì cơ sở dữ liệu hàng đêm.

### db_maint.jobs.max_rows
<!-- Title: Số dòng Job tối đa -->

Số này thiết lập số dòng tối đa được giữ lại cho bảng cơ sở dữ liệu jobs (mặc định: `1000000`); những dòng cũ nhất sẽ bị cắt tỉa trong quá trình bảo trì.

### db_maint.alerts.max_rows
<!-- Title: Số dòng Alert tối đa -->

Số này thiết lập số dòng tối đa được giữ lại cho bảng cơ sở dữ liệu alerts (mặc định: `100000`); những dòng cũ nhất sẽ bị cắt tỉa trong quá trình bảo trì.

### db_maint.snapshots.max_rows
<!-- Title: Số dòng Snapshot tối đa -->

Số này thiết lập số dòng tối đa được giữ lại cho bảng cơ sở dữ liệu snapshots (mặc định: `100000`); những dòng cũ nhất sẽ bị cắt tỉa trong quá trình bảo trì.

### db_maint.activity.max_rows
<!-- Title: Số dòng Hoạt động tối đa -->

Số này thiết lập số dòng tối đa được giữ lại cho bảng cơ sở dữ liệu hoạt động (activity) (mặc định: `100000`); những dòng cũ nhất sẽ bị cắt tỉa trong quá trình bảo trì.

### db_maint.servers.max_rows
<!-- Title: Số dòng Server tối đa -->

Số này thiết lập số dòng tối đa được giữ lại cho bảng cơ sở dữ liệu servers (mặc định: `10000`); những dòng cũ nhất sẽ bị cắt tỉa trong quá trình bảo trì.



## airgap
<!-- Title: Cấu hình Air-Gap -->
<!-- Type: Group -->

Phần này dành cho chế độ airgap, có thể ngăn PTOps thực hiện các kết nối gửi đi không được phép vượt quá một dải IP được chỉ định.

Xem [Chế độ Air-Gapped](hosting.md#air-gapped-mode) để biết thêm chi tiết.

### airgap.enabled
<!-- Title: Bật Air-Gap -->

Giá trị boolean này bật kiểm soát lưu lượng mạng gửi đi đối với các yêu cầu HTTP(S) do server khởi xướng (mặc định: `false`).

### airgap.whitelist
<!-- Title: Whitelist gửi đi -->

Mảng các CIDR/host này định nghĩa các điểm đến được cho phép rõ ràng đối với các yêu cầu gửi đi (mặc định bao gồm các mạng cục bộ/riêng tư); khi được bật, chỉ những địa chỉ này được cho phép.

### airgap.blacklist
<!-- Title: Blacklist gửi đi -->

Mảng các CIDR/host này định nghĩa các điểm đến luôn bị chặn đối với các yêu cầu gửi đi.



## client
<!-- Title: Cấu hình UI Client -->
<!-- Type: Group -->

Phần này dành cho cấu hình phía client, được sử dụng trong ứng dụng web PTOps.

### client.name
<!-- Title: Tên hiển thị ứng dụng -->

Chuỗi này là tên sản phẩm được hiển thị trong UI và được đưa vào văn bản email/phiên bản (mặc định: `PTOps`).

### client.company
<!-- Title: Tên công ty hiển thị -->

Chuỗi này được hiển thị như một phần của thông điệp bản quyền ở góc dưới bên trái của UI (mặc định: `PixlCore LLC`).

### client.logo_url
<!-- Title: URL hình ảnh Logo ứng dụng -->

Tùy chọn này trỏ đến logo được sử dụng trong header/sidebar của UI và trong email (mặc định: `/images/logotype.png`).

Đối với chế độ [email_logo](#email_logo) mặc định là `inline`, đây phải là đường dẫn web root cục bộ dưới thư mục `htdocs` của PTOps, vì PTOps tải hình ảnh từ đĩa trước khi đính kèm vào email gửi đi. Nếu `email_logo` được đặt thành `link`, đây có thể là một URL hình ảnh thông thường.

### client.hide_sidebar_sections
<!-- Title: Ẩn các mục thanh bên -->

Mảng này cho phép bạn ẩn toàn cục các phần thanh bên cụ thể cho tất cả các user, bất kể tùy chọn của họ là gì.

### client.tables
<!-- Title: Sắp xếp bảng mặc định -->

Object này cho phép bạn đặt các tùy chọn sắp xếp mặc định cho tất cả các bảng có thể sắp xếp trong UI.

### client.items_per_page
<!-- Title: Số phần tử danh sách mỗi trang -->

Số này thiết lập kích thước trang mặc định cho các chế độ xem danh sách và tìm kiếm (mặc định: `50`).

### client.alt_items_per_page
<!-- Title: Số phần tử thay thế mỗi trang -->

Số này thiết lập kích thước trang thứ cấp cho các widget nội tuyến và danh sách dropdown (mặc định: `25`).

### client.max_table_rows
<!-- Title: Số dòng bảng tối đa -->

Số này giới hạn số lượng hàng bảng được render phía client để giữ cho UI phản hồi nhanh (mặc định: `500`).

### client.max_menu_items
<!-- Title: Số phần tử menu tối đa -->

Giới hạn trên cho các phần tử hiển thị trong menu và dropdown (mặc định: `1000`).

### client.api_timeout_ms
<!-- Title: Timeout API (mili giây) -->

Số này thiết lập thời gian chờ API cho các yêu cầu từ client tính bằng mili giây (mặc định: `10000`).

### client.max_job_output
<!-- Title: Hiển thị output tối đa của Job -->

Kích thước tối đa của output job để hiển thị nội tuyến trên trang chi tiết (mặc định: `5 MB`).

### client.alt_to_toggle
<!-- Title: Giữ Alt để kích hoạt -->

Yêu cầu user giữ phím Opt/Alt để chuyển đổi thuộc tính `enabled` của một số thực thể nhất định trong UI (ngăn chặn các cú nhấp chuột vô tình).

### client.outdated_badges
<!-- Title: Hiển thị huy hiệu phiên bản cũ -->

Khi được đặt thành `true`, sẽ hiển thị một huy hiệu màu trên các phần thanh bên cho các phiên bản phần mềm đã lỗi thời trên các tab Conductor, Server và Marketplace. Chỉ dành cho Admin.

### client.new_event_template
<!-- Title: Template Event mới -->

Cung cấp các giá trị mặc định hợp lý cho các event mới (trigger, limit, action). Được sử dụng để điền trước vào form New Event.

### client.new_ticket_template
<!-- Title: Template Ticket mới -->

Cung cấp các giá trị mặc định để tạo các ticket mới. Được sử dụng để điền trước vào form New Ticket.

### client.chart_defaults
<!-- Title: Giá trị mặc định của biểu đồ -->

Các tùy chọn render biểu đồ mặc định (độ rộng đường, làm mịn, tick). Được áp dụng cho các biểu đồ monitor [pixl-chart](https://github.com/jhuckaby/pixl-chart) trong UI.

Các giá trị mặc định là:

```json
"chart_defaults": {
	"lineWidth": 2,
	"lineJoin": "round",
	"lineCap": "butt",
	"stroke": true,
	"fill": 0.5,
	"horizTicks": 6,
	"vertTicks": 6,
	"smoothingMaxSamples": 100,
	"smoothingMaxTotalSamples": 1000,
	"hoverSort": -1
}
```

Xem [pixl-chart](https://github.com/jhuckaby/pixl-chart) để biết thêm chi tiết.

### client.editor_defaults
<!-- Title: Trình biên tập code mặc định -->

Các tùy chọn trình biên tập code mặc định (tab, thụt lề, ngắt dòng) cho các trường [CodeMirror](https://codemirror.net/5/) trong UI. Các giá trị mặc định là:

```json
"editor_defaults": {
	"lineNumbers": false,
	"matchBrackets": false,
	"indentWithTabs": true,
	"tabSize": 4,
	"indentUnit": 4,
	"lineWrapping": true,
	"dragDrop": false
}
```

Xem [CodeMirror](https://codemirror.net/5/) để biết thêm chi tiết.

### client.bucket_upload_settings
<!-- Title: Cấu hình tải lên Bucket -->

Các giới hạn phía client đối với việc tải lên bucket (số lượng file tối đa/kích thước/loại file). Được thực thi trong UI trước khi tải lên, và được thực thi phía server. Các giá trị mặc định là:

```json
"bucket_upload_settings": {
	"max_files_per_bucket": 100,
	"max_file_size": 1073741824,
	"accepted_file_types": ""
}
```

### client.ticket_upload_settings
<!-- Title: Cấu hình tải lên Ticket -->

Các giới hạn phía client đối với các file đính kèm ticket (số lượng file tối đa/kích thước/loại file). Được thực thi trong UI trước khi tải lên, và được thực thi phía server. Các giá trị mặc định là:

```json
"ticket_upload_settings": {
	"max_files_per_ticket": 100,
	"max_file_size": 1073741824,
	"accepted_file_types": ""
}
```

### client.job_upload_settings
<!-- Title: Cấu hình tải lên Job -->

Các giới hạn phía client đối với việc tải lên file của job (số lượng file tối đa/kích thước/loại file) và thời gian hết hạn mặc định cho các file của user/plugin. Các giá trị mặc định là:

```json
"job_upload_settings": {
	"max_files_per_job": 100,
	"max_file_size": 1073741824,
	"accepted_file_types": "",
	"user_file_expiration": "30 days",
	"plugin_file_expiration": "30 days"
}
```



## Storage
<!-- Title: Cấu hình Storage -->
<!-- Type: Group -->

Phần này cấu hình hệ thống con bộ lưu trữ backend được sử dụng bởi PTOps.

Để biết tài liệu đầy đủ về hệ thống lưu trữ, xem [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage).

### Storage.engine
<!-- Title: Engine -->

Chọn engine lưu trữ (ví dụ: Hybrid, Filesystem, SQLite, S3). Mặc định là `Hybrid`, sử dụng kết hợp giữa SQLite cho các bản ghi dữ liệu JSON và filesystem cho việc lưu trữ file nhị phân.

Xem [Engines](https://github.com/jhuckaby/pixl-server-storage#engines) để biết thêm chi tiết.

### Storage.list_page_size
<!-- Title: Kích thước trang danh sách -->

Kích thước trang mặc định cho các danh sách lưu trữ (mặc định: `100`).

### Storage.hash_page_size
<!-- Title: Kích thước trang hash -->

Kích thước trang mặc định cho các hash lưu trữ (mặc định: `100`).
### Storage.concurrency
<!-- Title: Độ đồng thời -->

Số lượng hoạt động I/O đồng thời tối đa (mặc định: `32`).

### Storage.transactions
<!-- Title: Giao dịch (Transactions) -->

Bật ghi giao dịch (giao dịch) (mặc định: `true`). Hãy duy trì việc bật tính năng này!

### Storage.trans_auto_recover
<!-- Title: Tự động khôi phục giao dịch -->

Tự động khôi phục các giao dịch chưa hoàn thành khi khởi động (mặc định: `true`).

### Storage.trans_dir
<!-- Title: Đường dẫn thư mục giao dịch -->

Thư mục cục bộ cho log rollback giao dịch và sổ sách khôi phục (mặc định: `data/_transactions`). Các engine hỗ trợ giao dịch native như SQLite, Postgres và Redis không ghi log rollback cho các commit thành công, nhưng thư mục này vẫn được sử dụng để quản lý các giao dịch.

### Storage.log_event_types
<!-- Title: Log loại Event -->

Theo mặc định, tính năng này bật ghi log cho các thao tác get/put/delete và các hoạt động khác. Kiểm soát sự kiện lưu trữ nào được ghi log.

### Storage.Hybrid
<!-- Title: Cấu hình Engine Hybrid -->

Cấu hình cho backend lưu trữ [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid).

### Storage.Filesystem
<!-- Title: Cấu hình Engine Filesystem -->

Các tùy chọn cho backend Filesystem (thư mục cơ sở, namespacing, đường dẫn thô, fsync, bộ nhớ cache trong RAM). Xem [Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem) để biết chi tiết.

### Storage.SQLite
<!-- Title: Cấu hình Engine SQLite -->

Các tùy chọn cho backend SQLite (thư mục cơ sở, tên file, pragmas, cache, backup). Xem [SQLite](https://github.com/jhuckaby/pixl-server-storage#sqlite) để biết chi tiết.

### Storage.AWS
<!-- Title: Cấu hình AWS -->

Các tùy chọn cho AWS SDK (region/credential) được S3 sử dụng khi khả dụng. Xem [Amazon S3](https://github.com/jhuckaby/pixl-server-storage#amazon-s3) để biết chi tiết.

### Storage.S3
<!-- Title: Cấu hình Engine S3 -->

Các tùy chọn cho backend S3 (timeout, số lần thử lại, tham số bucket, caching). Xem [Amazon S3](https://github.com/jhuckaby/pixl-server-storage#amazon-s3) để biết chi tiết.



## WebServer
<!-- Title: Cấu hình Web Server -->
<!-- Type: Group -->

Phần này cấu hình web server được sử dụng bởi PTOps.

Để cấu hình đầy đủ cho web server, xem [pixl-server-web](https://github.com/jhuckaby/pixl-server-web).

### WebServer.port
<!-- Title: Cổng lắng nghe -->

Cổng HTTP cho web server tích hợp sẵn (mặc định: `5522`).

### WebServer.htdocs_dir
<!-- Title: Đường dẫn thư mục Web Root -->

Thư mục cơ sở cho các tài sản tĩnh và UI web (mặc định: `htdocs`).

Nếu đây là một đường dẫn tương đối, nó sẽ được tính từ thư mục gốc của PTOps, thông thường là `/opt/xyops`.

### WebServer.max_upload_size
<!-- Title: Kích thước tải lên tối đa (bytes) -->

Kích thước tải lên tối đa được chấp nhận tính bằng byte (mặc định: `1073741824`).

### WebServer.static_ttl
<!-- Title: TTL tĩnh (giây) -->

TTL cache cho việc phục vụ các tài sản tĩnh (mặc định: `31536000`).

### WebServer.static_index
<!-- Title: Tên file index mặc định -->

File index mặc định cho các thư mục gốc (mặc định: `index.html`).

### WebServer.server_signature
<!-- Title: Chữ ký Server -->

Chuỗi chữ ký server đi kèm trong các header (mặc định: `PTOps`).

### WebServer.compress_text
<!-- Title: Tự động nén văn bản -->

Bật nén gzip/deflate tự động cho các phản hồi văn bản (mặc định: `true`).

### WebServer.enable_brotli
<!-- Title: Sử dụng nén Brotli -->

Bật nén Brotli khi được hỗ trợ (mặc định: `true`).

### WebServer.timeout
<!-- Title: Timeout socket rảnh rỗi (giây) -->

Thời gian chờ rảnh rỗi trên mỗi yêu cầu đối với các kết nối đến tính bằng giây (mặc định: `30`).

### WebServer.regex_json
<!-- Title: Regex Content-Type JSON -->

Regex cho Content-Type được xử lý như JSON trong việc phản hồi (mặc định: `(text|javascript|js|json)`).

### WebServer.clean_headers
<!-- Title: Dọn dẹp Response Header -->

Loại bỏ các ký tự HTTP header không an toàn khỏi phản hồi (mặc định: `true`).

### WebServer.log_socket_errors
<!-- Title: Ghi log lỗi Socket -->

Kiểm soát việc ghi log các lỗi socket cấp thấp (mặc định: `false`).

**Lưu ý:** Tùy chọn này tạo ra khá nhiều tiếng ồn và ghi nhiều lỗi vô hại.

### WebServer.response_headers
<!-- Title: Response Header tùy chỉnh -->

Các header bổ sung được thêm vào tất cả các phản hồi. Mặc định là không thêm gì.

### WebServer.keep_alives
<!-- Title: Chế độ Keep-Alive -->
<!-- Type: Menu -->
<!-- Items: ["default", "request", "close"] -->

Kiểm soát hành vi keep-alive của HTTP (xem [keep_alives](https://github.com/jhuckaby/pixl-server-web#keep_alives) để biết chi tiết).

### WebServer.keep_alive_timeout
<!-- Title: Timeout Keep-Alive (giây) -->

Thời gian chờ rảnh rỗi cho các kết nối keep-alive tính bằng giây (mặc định: `30`).

### WebServer.max_connections
<!-- Title: Số kết nối tối đa -->

Số lượng kết nối socket đồng thời tối đa được phép (mặc định: `2048`).

### WebServer.max_concurrent_requests
<!-- Title: Số yêu cầu đồng thời tối đa -->

Số lượng yêu cầu đồng thời tối đa được phép (mặc định: `256`).

### WebServer.log_requests
<!-- Title: Ghi log tất cả các yêu cầu -->

Bật ghi log giao dịch trên mỗi yêu cầu (mặc định: `false`).

**Lưu ý:** Việc này tạo ra khá nhiều log.

### WebServer.legacy_callback_support
<!-- Title: Hỗ trợ Callback cũ -->

Bật các pattern JSONP/callback cũ cho các client cũ hơn (mặc định: `false`). Không bật tính năng này trên môi trường production.

### WebServer.startup_message
<!-- Title: Thông báo khi khởi động -->

Phát một thông báo khởi động với URL server ra console (mặc định: `false`). Vui lòng để tắt cài đặt này, vì PTOps tự phát ra thông báo khởi động của riêng mình.

### WebServer.debug_ttl
<!-- Title: Ghi đè TTL Debug -->

Đặt TTL bộ nhớ đệm mặc định thành `0` khi chạy ở chế độ debug (mặc định: `true`).

### WebServer.debug_bind_local
<!-- Title: Bind cục bộ khi Debug -->

Chỉ bind vào localhost khi chạy ở chế độ debug (mặc định: `true`).

### WebServer.whitelist
<!-- Title: Whitelist IP -->

Danh sách IP/CIDR client được phép truy cập webserver một cách rõ ràng (mặc định: tất cả).

### WebServer.blacklist
<!-- Title: Blacklist IP -->

Danh sách IP/CIDR client bị từ chối rõ ràng ở cấp webserver (mặc định: không có).

### WebServer.uri_response_headers
<!-- Title: Response Header theo URI -->

Cho phép map regex URI với các response header tùy chỉnh. PTOps sử dụng tính năng này để đặt CSP và các header bảo mật cho các đường dẫn HTML.

### WebServer.https
<!-- Title: Kích hoạt HTTPS (TLS) -->

Bật hỗ trợ HTTPS (mặc định: `true`).

### WebServer.https_port
<!-- Title: Cổng lắng nghe HTTPS -->

Cổng lắng nghe HTTPS (mặc định: `5523`).

### WebServer.https_cert_file
<!-- Title: Đường dẫn file chứng chỉ -->

Đường dẫn file chứng chỉ TLS (mặc định: `conf/tls.crt`).

Nếu đây là một đường dẫn tương đối, nó sẽ được tính từ thư mục gốc của PTOps, thông thường là `/opt/xyops`.

### WebServer.https_key_file
<!-- Title: Private Key File Path -->

Đường dẫn file khóa riêng tư TLS (mặc định: `conf/tls.key`).

Nếu đây là một đường dẫn tương đối, nó sẽ được tính từ thư mục gốc của PTOps, thông thường là `/opt/xyops`.

### WebServer.https_force
<!-- Title: Bắt buộc chuyển hướng HTTPS -->

Bắt buộc chuyển hướng từ HTTP sang HTTPS (mặc định: `false`).

### WebServer.https_timeout
<!-- Title: Timeout socket rảnh rỗi HTTPS (giây) -->

Thời gian chờ rảnh rỗi cho HTTPS trên mỗi yêu cầu tính bằng giây (mặc định: `30`).

### WebServer.https_header_detect
<!-- Title: Phát hiện Header HTTPS -->

Bao gồm các header phổ biến để phát hiện HTTPS khi đứng sau một reverse proxy.



## User
<!-- Title: Cấu hình Quản lý User -->
<!-- Type: Group -->

Phần này cấu hình hệ thống quản lý user được sử dụng bởi PTOps.

Để cấu hình đầy đủ cho user, xem [pixl-server-user](https://github.com/jhuckaby/pixl-server-user).

### User.session_expire_days
<!-- Title: Hết hạn phiên làm việc (ngày) -->

Thời gian sống của phiên làm việc tính bằng ngày trước khi yêu cầu đăng nhập lại (mặc định: `365`).

### User.max_failed_logins_per_hour
<!-- Title: Số lần đăng nhập sai tối đa mỗi giờ -->

Giới hạn số lần đăng nhập không thành công cho mỗi user mỗi giờ (mặc định: `5`).

### User.max_forgot_passwords_per_hour
<!-- Title: Yêu cầu quên mật khẩu tối đa mỗi giờ -->

Giới hạn số lượng yêu cầu đặt lại mật khẩu cho mỗi user mỗi giờ (mặc định: `3`).

### User.free_accounts
<!-- Title: Tài khoản tự đăng ký -->

Cho phép user tự đăng ký mà không cần thư mời của admin (mặc định: `false`).

### User.sort_global_users
<!-- Title: Sắp xếp danh sách User toàn cục -->

Sắp xếp danh sách user toàn cục (ảnh hưởng đến thứ tự sắp xếp trong UI admin, mặc định: `false`). Đang thử nghiệm.

### User.use_bcrypt
<!-- Title: Sử dụng Bcrypt -->

Sử dụng bcrypt để băm mật khẩu (mặc định: `true`). Vui lòng để bật tính năng này.

### User.use_csrf
<!-- Title: Sử dụng Token CSRF -->

Sử dụng Token CSRF để tăng tính bảo mật (mặc định: `true`). Vui lòng để bật tính năng này.

### User.mail_logger
<!-- Title: Logger thư điện tử -->

Đính kèm output logger vào nhật ký thư gửi đi để chẩn đoán (mặc định: `true`).

### User.valid_username_match
<!-- Title: Regex Username hợp lệ -->

Các ký tự được phép cho username (mặc định: `^[\\w\\-\\.]+$`).

### User.block_username_match
<!-- Title: Regex chặn Username -->

Một regex cho các username được bảo lưu/bị chặn (để bảo mật và bảo vệ không gian tên).

### User.cookie_settings
<!-- Title: Cấu hình Cookie -->

Thiết lập đường dẫn cookie, chính sách bảo mật, httpOnly và sameSite. Kiểm soát các thuộc tính cookie phiên làm việc.



## SSO

Phần này cấu hình Single Sign-On bằng cách sử dụng các header đáng tin cậy. Xem [hướng dẫn SSO](sso.md) để biết chi tiết thiết lập và các ví dụ.

### SSO.enabled

Giá trị boolean này bật SSO và tắt tính năng đăng nhập bằng username/password cục bộ (mặc định: `false`).

### SSO.whitelist

Mảng các IP/CIDR này giới hạn địa chỉ client nào có thể gửi các header đáng tin cậy (mặc định cho phép localhost, dải mạng riêng tư và link-local).

### SSO.header_map

Object này ánh xạ các header đáng tin cậy gửi đến với các trường user của PTOps (`username`, `full_name`, `email`, `groups`).

### SSO.cleanup_username

Giá trị boolean này làm sạch username khi lấy từ một email (loại bỏ các ký tự không hợp lệ, viết thường, sử dụng phần local-part) (mặc định: `true`).

### SSO.cleanup_full_name

Giá trị boolean này lấy tên hiển thị từ một email (sử dụng phần local-part, thay thế các dấu chấm bằng dấu cách, viết hoa chữ cái đầu) (mặc định: `true`).

### SSO.group_role_map

Object này ánh xạ tên nhóm IdP với ID role của PTOps để tự động chỉ định các role khi đăng nhập (mặc định: `{}`).

### SSO.group_role_separator

Ký tự tùy chọn để phân tách danh sách nhóm bên ngoài (mặc định: `,`).

### SSO.group_privilege_map

Object này ánh xạ tên nhóm IdP với các key privilege để tự động chỉ định các privilege khi đăng nhập (mặc định: `{}`).

### SSO.replace_roles

Giá trị boolean này thay thế tất cả các role hiện có của user bằng các role từ `group_role_map` trong mỗi lần đăng nhập (mặc định: `false`).

### SSO.replace_privileges

Giá trị boolean này thay thế tất cả các privilege hiện có của user bằng các privilege từ `group_privilege_map` trong mỗi lần đăng nhập (mặc định: `false`).

### SSO.admin_bootstrap

Chuỗi này tạm thời cấp toàn bộ quyền admin cho đúng username khớp để thực hiện thiết lập ban đầu; xóa đi sau khi cấu hình các nhóm (mặc định: trống).

### SSO.logout_url

Chuỗi này là URL để chuyển hướng đến sau khi PTOps xóa phiên của nó, để proxy xác thực/IdP của bạn có thể hoàn tất đăng xuất (ví dụ: `/oauth2/sign_out?rd=...`).



## Debug

### Debug.enabled

Bật gỡ lỗi server từ xa qua Chrome Dev Tools (mặc định: `false`).



## config_overrides_file

Khi các cài đặt được thay đổi thông qua UI, các cấu hình ghi đè sẽ được lưu ở đây và được áp dụng đè lên trên `config.json`.
