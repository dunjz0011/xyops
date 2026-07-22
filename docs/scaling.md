# Scaling

## Tổng Quan

Đang chạy PTOps trong production thực tế với nhiều server và/hoặc nhiều job đang chạy? Hãy đọc các phương pháp tốt nhất sau đây để mở rộng quy mô triển khai của bạn. Hướng dẫn này bổ sung cho Self-Hosting -- hãy bắt đầu từ đó trước: xem [Tự Triển Khai (Self-Hosting)](hosting.md).

## Nâng Cấp Phần Cứng

- CPU core: PTOps là đa tiến trình (multi-process) và có độ song song cao. Nhiều core hơn giúp scheduler, web server, storage I/O, và nén log chạy trơn tru dưới tải cao.
- RAM: Thêm dư địa cho heap Node.js, cache trong tiến trình, cache của storage engine, và page cache của OS. RAM ảnh hưởng trực tiếp đến tỷ lệ cache hit và giảm I/O đĩa/remote.
- Storage: Ưu tiên SSD/NVMe nhanh cho Filesystem/SQLite cục bộ và log archive. Đảm bảo đủ IOPS cho log job song song, snapshot, và upload.
- Network: Với fleet lớn, đảm bảo throughput NIC tốt và độ trễ thấp giữa conductor, worker, và storage chia sẻ. Với production multi-conductor, đặt conductor gần cả JSON data store (Redis hoặc Postgres) và file store (S3 hoặc tương thích S3).
- Giới hạn OS: Tăng giới hạn file descriptor và process cho các node bận rộn (ví dụ `ulimit -n`, systemd Limits). Đảm bảo swap được cấu hình cẩn trọng để tránh heap thrash.

## Tăng Bộ Nhớ Node.js

PTOps tuân theo biến môi trường `NODE_MAX_MEMORY` để đặt kích thước heap old-space của Node (mặc định 4096 MB).

- Ví dụ: `export NODE_MAX_MEMORY=8192` trước khi khởi động PTOps (hoặc `-e NODE_MAX_MEMORY=8192` cho Docker).
- Để lại dư địa cho OS, filesystem cache, và bất kỳ daemon ngoài nào. Trên instance có 16 GB RAM, heap 8-12 GB là điển hình tuỳ theo workload khác.
- Theo dõi RSS so với heap usage theo thời gian và điều chỉnh cẩn trọng để tránh swap.

## Tăng RAM Cache Cho Storage

PTOps dùng [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage) và hầu hết engine hỗ trợ cache trong bộ nhớ cho JSON record. Cache lớn hơn giảm số lần round-trip đến disk hoặc backend network.

- Mặc định: Config mẫu bật cache với `maxBytes` ≈ 100 MB và `maxItems` ≈ 100k cho Filesystem và SQLite.
- Đề xuất: Với các cài đặt production lớn, xem xét tăng 5-10× nếu có RAM dư, sau đó tinh chỉnh dựa trên tỷ lệ hit và độ trễ.
- Nơi cấu hình:
  - SQLite: `Storage.SQLite.cache.enabled`, `Storage.SQLite.cache.maxBytes`, `Storage.SQLite.cache.maxItems`.
  - Filesystem: `Storage.Filesystem.cache.enabled`, `...maxBytes`, `...maxItems`.
  - S3: `Storage.S3.cache.enabled`, `...maxBytes`, `...maxItems` (hữu ích để giảm số lần GET S3).
- Xem [Storage Engines](https://github.com/jhuckaby/pixl-server-storage#engines) để biết chi tiết và các lưu ý riêng theo engine (ví dụ cái gì được cache, chính sách eviction, hành vi binary vs JSON).

## Tắt QuickMon

QuickMon gửi số liệu nhẹ mỗi giây từ tất cả satellite. Ở quy mô lớn, telemetry theo giây có thể tích tụ đáng kể. Để giảm tải ingest và traffic WebSocket, hãy tắt nó:

- Đặt `satellite.config.quickmon_enabled` thành `false` trong config của bạn. Cài đặt này được phân phối tự động đến tất cả server khi chúng kết nối.
- Việc giám sát theo phút vẫn được bật thông qua `satellite.config.monitoring_enabled`.

## Tắt Giám Sát Network Trong Job

Với server Linux có số lượng lớn kết nối network đang mở, bạn có thể muốn tắt giám sát network thời gian thực trong khi job đang chạy. Theo mặc định, PTOps Satellite liên tục giám sát tài nguyên server bao gồm process và kết nối network, trong khi có job đang hoạt động trên server. Điều này có thể tạo thêm tải trên các server có hàng chục nghìn kết nối network.

Để tắt giám sát network trong khi job đang chạy, đặt property `disable_job_network_io` thành `true` trong file `/opt/xyops/satellite/config.json` trên các server lớn của bạn:

```json
"disable_job_network_io": true
```

Hoặc, bạn có thể đặt nó toàn cục trong object [satellite.config](config.md#satellite-config) trên server conductor chính của PTOps, và nó sẽ tự động lan truyền ra tất cả server vào lần kết nối tiếp theo của chúng.

## Cài Đặt Multi-Conductor

Multi-conductor yêu cầu storage ngoài dùng chung sao cho tất cả conductor thấy cùng trạng thái. Với production thực tế, dùng cài đặt Hybrid với Redis hoặc Postgres cho dữ liệu JSON, cùng S3 hoặc dịch vụ tương thích S3 cho file. Redis và Postgres hỗ trợ transaction storage gốc, nên database sẽ quyết định commit hoặc rollback nếu một conductor gặp lỗi giữa transaction.

Để biết chi tiết, xem [Hướng Dẫn Cài Đặt Storage](storage.md).

### Cảnh Báo NFS

Mặc dù có thể dùng engine [Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem) qua mount NFS chia sẻ cho nhiều conductor, chúng tôi **không khuyến nghị** điều này cho production.  NFS không đảm bảo tính nguyên tử (atomicity) hoặc khoá (locking) đủ mạnh cho các pattern ghi đồng thời của PTOps, và có thể dẫn đến race condition hoặc dữ liệu hỏng dưới tải cao.  Hãy dùng Redis/Postgres cho dữ liệu JSON và S3 cho file thay vì dựa vào NFS.

## Sao Lưu Cơ Sở Dữ Liệu

Nếu bạn dùng engine SQLite, PTOps có thể tự động sao lưu file cơ sở dữ liệu theo định kỳ, giúp bạn phục hồi nhanh nếu có sự cố. Cấu hình trong `Storage.SQLite.backups` (mặc định giữ lại 7 bản gần nhất). Lưu ý các bản sao lưu sẽ khoá DB trong thời gian ngắn khi đang sao chép.

## Lỗi Nghiêm Trọng (Critical Errors)

Với các lỗi nghiêm trọng (ví dụ crash và nâng cấp thất bại) bạn có thể cấu hình một [System Hook](syshooks.md) toàn cục để tự động gửi email cho từng lỗi. Đặt cái này trong file `config.json` của bạn, trong object [hooks](config.md#hooks):

```json
"hooks": {
	"critical": {
		"email": "ops-oncall@yourcompany.com"
	}
}
```

Hoặc bạn có thể cấu hình hook để tạo ticket (khi đó sẽ tự động email cho tất cả assignee):

```json
"hooks": {
	"critical": {
		"ticket": {
			"type": "issue",
			"assignees": ["admin"]
		}
	}
}
```

Xem [System Hooks](syshooks.md) để biết thêm chi tiết.

## Email Alert Giám Sát

Với alert giám sát server, bạn có thể muốn gửi email. Việc này có thể thiết lập ở ba cấp độ khác nhau:

- Ở cấp độ alert: Bạn có thể sửa từng định nghĩa alert, và cấu hình action email cho những alert quan trọng (ví dụ "Low Memory" là một lựa chọn tốt).
- Ở cấp độ server group: Bạn có thể đặt action alert mặc định cho tất cả alert trong các server group cụ thể (ví dụ "Production Databases").
- Ở cấp độ cấu hình toàn cục. Xem bên dưới...

Bạn có thể thêm các action alert "universal" toàn cục trong object cấu hình [alert_universal_actions](config.md#alert_universal_actions). Các action này sẽ chạy cho **tất cả** alert. Ví dụ:

```json
"alert_universal_actions": [
	{
		"enabled": true,
		"hidden": true,
		"condition": "alert_new",
		"type": "snapshot"
	},
	{
		"enabled": true,
		"condition": "alert_new",
		"type": "email",
		"email": "oncall-pager@mycompany.com"
	}
]
```

## Danh Sách Kiểm Tra Bảo Mật

Củng cố điểm truy cập web và config PTOps của bạn trước khi go-live:

- Cấu hình Plugin chạy dưới các user và/hoặc group hạn chế quyền (xem [Plugin Credentials](#plugin-credentials)).
- Giới hạn IP đầu vào bằng [WebServer.whitelist](https://github.com/jhuckaby/pixl-server-web#whitelist) (hỗ trợ CIDR). Chỉ cho phép các dải IP công ty và load balancer của bạn.
- Giới hạn Host header/SNI hợp lệ qua [WebServer.allow_hosts](https://github.com/jhuckaby/pixl-server-web#allow_hosts) chỉ cho các domain production của bạn (ví dụ `xyops.yourcompany.com`).
- HTTPS: Bật [WebServer.https](https://github.com/jhuckaby/pixl-server-web#https), đặt đường dẫn cert/key, và xem xét [WebServer.https_force](https://github.com/jhuckaby/pixl-server-web#https_force) để HTTP redirect sang HTTPS. Nếu terminate TLS ở phía trước, cấu hình [WebServer.https_header_detect](https://github.com/jhuckaby/pixl-server-web#https_header_detect).
- Giới hạn upload: Giảm [WebServer.max_upload_size](https://github.com/jhuckaby/pixl-server-web#max_upload_size) từ mặc định 1 GB xuống mức tối đa dự kiến của bạn (cũng điều chỉnh giới hạn theo từng tính năng trong `client.*_upload_settings`).
- Giới hạn kết nối: Tinh chỉnh [WebServer.max_connections](https://github.com/jhuckaby/pixl-server-web#max_connections) và [WebServer.max_concurrent_requests](https://github.com/jhuckaby/pixl-server-web#max_concurrent_requests) khớp với năng lực instance. Tuỳ chọn đặt [WebServer.max_queue_length](https://github.com/jhuckaby/pixl-server-web#max_queue_length) và [WebServer.max_queue_active](https://github.com/jhuckaby/pixl-server-web#max_queue_active) để chặn quá tải.
- Timeout: Xem xét [WebServer.socket_prelim_timeout](https://github.com/jhuckaby/pixl-server-web#socket_prelim_timeout), [WebServer.timeout](https://github.com/jhuckaby/pixl-server-web#timeout), [WebServer.request_timeout](https://github.com/jhuckaby/pixl-server-web#request_timeout), và [WebServer.keep_alive_timeout](https://github.com/jhuckaby/pixl-server-web#keep_alive_timeout) để giảm thiểu pattern slow-loris và giới hạn thời gian request.
- Bind address: Nếu chạy sau proxy, đặt [WebServer.bind_address](https://github.com/jhuckaby/pixl-server-web#bind_address) phù hợp và cấu hình [WebServer.public_ip_offset](https://github.com/jhuckaby/pixl-server-web#public_ip_offset) để chọn đúng IP client từ header proxy.
- Header/CSP: Dùng [WebServer.uri_response_headers](https://github.com/jhuckaby/pixl-server-web#uri_response_headers) để áp CSP, HSTS, và các header bảo mật khác cho route HTML.
- Kiểm soát truy cập: Dùng [WebServer.default_acl](https://github.com/jhuckaby/pixl-server-web#default_acl) cho handler riêng tư và xác minh chính sách API key/SSO. Khoá các endpoint admin sau SSO khi phù hợp.
- Xoay secret key mỗi vài tháng. Xem [Xoay Secret Key](hosting.md#secret-key-rotation) để biết chi tiết.

## Thông Tin Xác Thực Plugin

[Plugin PTOps](plugins.md) có thể được cấu hình chạy dưới bất kỳ user và/hoặc group nào, bằng cách chỉ định UID / GID cho từng plugin. Tuy nhiên, bạn cũng có thể muốn chỉ định một bộ user/group mặc định qua object cấu hình [default_plugin_credentials](config.md#default_plugin_credentials). Dùng cái này bạn có thể đặt mặc định cho từng loại plugin:

```json
"default_plugin_credentials": {
	"action": { "uid": "xyops", "gid": "xyops" },
	"event": { "uid": "xyops", "gid": "xyops" },
	"monitor": { "uid": "xyops", "gid": "xyops" },
	"scheduler": { "uid": "xyops", "gid": "xyops" }
}
```

Lưu ý các plugin riêng lẻ vẫn có thể chỉ định UID/GID của riêng chúng, và sẽ ghi đè lên mặc định. Ngoại lệ là [Marketplace Plugin](marketplace.md), mà rõ ràng **không thể** chỉ định UID hoặc GID riêng, và sẽ **luôn luôn** dùng thông tin xác thực mặc định bạn đặt trong `default_plugin_credentials`.

Cần lưu ý rằng Plugin dựa trên Docker, bao gồm [Docker Shell Plugin](plugins.md#docker-plugin) tích hợp sẵn, yêu cầu quyền cao hơn để khởi chạy container của chúng. Nếu bạn định dùng tính năng Docker trong PTOps, hãy đảm bảo user hạn chế quyền của bạn có quyền đọc/ghi vào Docker socket, hoặc đặt các plugin cụ thể đó chạy dưới quyền root.

Lưu ý Microsoft Windows không có khái niệm UID hoặc GID, nên Plugin trên nền tảng đó sẽ luôn chạy với quyền administrator trừ khi bạn cụ thể script để không làm vậy. Ví dụ, bạn có thể khởi chạy script Powershell dưới quyền một user khác bằng thông tin xác thực của họ (nên được lưu trong [Secret Vault](secrets.md)):

```powershell
# Đọc thông tin xác thực từ biến môi trường (secret vault)
$username = $env:WIN_USERNAME
$password = $env:WIN_PASSWORD

# Chuyển password thành SecureString
$secure = ConvertTo-SecureString $password -AsPlainText -Force

# Xây dựng credential object
$cred = New-Object System.Management.Automation.PSCredential ($username, $secure)

# Khởi chạy child script dưới user đích
Start-Process powershell `
    -Credential $cred `
	-LoadUserProfile `
	-WorkingDirectory "C:\scripts" `
    -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File C:\scripts\child.ps1" `
    -Wait
```

## Giới Hạn Tốc Độ (Rate Limiting)

Nếu bạn dùng cài đặt [Multi-Conductor với Nginx](hosting.md#multi-conductor-with-nginx) hoặc [Multi-Conductor với OAuth2-Proxy và TLS với Nginx](sso.md#multi-conductor-with-oauth2-proxy-and-tls-with-nginx), hãy xem xét thêm cấu hình giới hạn tốc độ. Để làm điều này, thêm một volume bind mới vào container Docker Nginx:

```
-v ./limits.conf:/etc/nginx/conf.d/limits.conf:ro
```

Và trong file `limits.conf` phía host, thêm cấu hình Nginx như sau:

```
limit_req_zone $binary_remote_addr zone=req_per_ip:20m rate=100r/s;
limit_req_status 429;
```

Cái này sẽ giới hạn traffic ở 100 request/giây trên mỗi IP, dùng đến 20MB cache IP (khoảng 300K IP). Để biết thêm chi tiết xem [ngx_http_limit_req_module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html).

## Ý Tưởng Tinh Chỉnh Thêm

- Throughput job: Tăng [max_jobs_per_min](config.md#max_jobs_per_min) một cách cẩn trọng và theo dõi CPU/RAM của worker. Đồng bộ với các limit theo category và ràng buộc workflow của bạn.
- Lưu giữ dữ liệu: Giới hạn kích thước lịch sử để tránh tăng trưởng không kiểm soát qua các property `*.max_rows` trong [db_maint](config.md#db_maint) (job, alert, snapshot, activity, server). Điều chỉnh để phù hợp ngân sách storage của bạn.
- Đồng thời khi search: Nếu bạn thực hiện search file thường xuyên, xem xét tăng [search_file_threads](config.md#search_file_threads) một cách cẩn trọng (bị ràng buộc bởi I/O; hãy test trước).
- Logging: Tắt log request hoặc storage event chi tiết trong production trừ khi đang debug tích cực (`WebServer.log_requests`, `Storage.log_event_types`).

## Tài Liệu Tham Khảo

- [Hướng Dẫn Tự Triển Khai PTOps](hosting.md)
- [Hướng Dẫn Cài Đặt Storage PTOps](storage.md)
- [Tài liệu web server](https://github.com/jhuckaby/pixl-server-web)
