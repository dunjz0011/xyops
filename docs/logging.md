# Ghi Log (Logging)

## Tổng Quan

Tài liệu này giải thích cách logging hoạt động trong PTOps, liệt kê từng file log của ứng dụng, và hiển thị một dòng ví dụ từ mỗi file. PTOps dùng dịch vụ logging [pixl-server](https://github.com/jhuckaby/pixl-server) (cung cấp năng lượng bởi [pixl-logger](https://github.com/jhuckaby/pixl-logger)), ghi văn bản thuần với các `[cột][phân][cách][bằng][dấu][ngoặc]`.

## Định Dạng Log

Mỗi dòng log được phân cách bằng dấu ngoặc với các cột sau, theo thứ tự:

| Cột Log | Mô Tả |
|---|---|
| `hires_epoch` | Thời gian Unix độ phân giải cao (số thực dấu chấm động, giây). |
| `date` | Timestamp dễ đọc: `YYYY-MM-DD HH:MI:SS` (giờ server cục bộ). |
| `hostname` | Hostname của server đã ghi mục log này. |
| `pid` | Process ID (PID) của process ghi log. |
| `component` | Tên component đã tạo mục log này. |
| `category` | Một trong `debug`, `transaction`, hoặc `error`. |
| `code` | Mức debug (1-10), mã transaction, hoặc mã lỗi. |
| `msg` | Nội dung message. |
| `data` | Payload dữ liệu JSON tuỳ chọn (có thể trống). |

Dòng ví dụ:

```
[1763880095.551][2025-11-22 22:41:35][joemax.lan][10341][API][debug][9][Activating namespaced API handler: app/api_get_server for URI: /api/app/get_server][]
```

Thứ tự cột có thể cấu hình qua [log_columns](config.md#log_columns) (xem cấu hình dưới đây), nhưng các giá trị mặc định trên được khuyến nghị.

## Tóm Tắt Cấu Hình

Các cài đặt logging cốt lõi nằm trong `config.json` và giá trị mặc định là:

```json
{
  "log_dir": "logs",
  "log_filename": "[component].log",
  "log_columns": ["hires_epoch", "date", "hostname", "pid", "component", "category", "code", "msg", "data"],
  "log_archive_path": "logs/archives/[yyyy]/[mm]/[dd]/[filename]-[yyyy]-[mm]-[dd].log.gz",
  "log_crashes": true,
  "debug_level": 9
}
```

Nếu [log_dir](config.md#log_dir) là đường dẫn tương đối, nó được tính dựa trên thư mục gốc PTOps (thường là `/opt/xyops`).

Thuộc tính [log_filename](config.md#log_filename) mặc định là `[component].log` để mỗi component ghi vào file riêng của nó. Để dùng một log gộp duy nhất, đặt một tên file cụ thể, ví dụ:

```json
"log_filename": "xyops.log"
```

## Log Ứng Dụng

Dưới đây là tất cả các file log ứng dụng hiện tại, mỗi file kèm mô tả ngắn và một dòng ví dụ thực tế lấy từ repository này.

### Action.log
Các action được kích hoạt bởi alert, monitor, hoặc điều kiện job (ví dụ email, web hook, plugin).

```
[1763841931.973][2025-11-22 12:05:31][joemax.lan][92938][Action][debug][8][Running job actions for condition: complete][{"job_id":"jmiapxwar79"}]
```

### API.log
Các request API HTTP gửi đến, định tuyến, xác thực quyền, và hoạt động của handler.

```
[1763880095.55][2025-11-22 22:41:35][joemax.lan][10341][API][debug][6][Handling API request: GET /api/app/get_server?id=smf4j79snhe&cachebust=1763880046.493][]
```

### Comm.log
Các kết nối, ngắt kết nối của client WebSocket, và các cập nhật trang/hoạt động.

```
[1763880034.062][2025-11-22 22:40:34][joemax.lan][10341][Comm][debug][6][User socket has authenticated successfully: wsmibcmostgu][{"username":"admin"}]
```

### Debug.log
Các thông báo dịch vụ gỡ lỗi nội bộ và chẩn đoán.

```
[1763879905.013][2025-11-22 22:38:25][joemax.lan][10341][Debug][debug][3][Debug service listening for base URI: /internal/debug][]
```

### Error.log
Tất cả các lỗi trong hệ thống (lỗi xác thực, sự cố lưu trữ, lỗi job, ngắt kết nối, v.v.).

```
[1763879534.953][2025-11-22 22:32:14][joemax.lan][10176][Storage][error][rollback][Aborting transaction: 16][{"path":"timeline/smf4j79snhe/hourly","actions":0}]
```

### Filesystem.log
Các sự kiện từ engine lưu trữ hệ thống file cục bộ (các file nhị phân, đường dẫn, mở/đóng, v.v.).

```
[1763879912.74][2025-11-22 22:38:32][joemax.lan][10341][Filesystem][debug][9][Fetching Binary Stream: users/admin/avatar/64.png][data/users/admin/avatar/64.png]
```

### Hybrid.log
Quy trình điều phối và vòng đời lưu trữ tài liệu/nhị phân Hybrid.

```
[1763879904.984][2025-11-22 22:38:24][joemax.lan][10341][Hybrid][debug][2][Setting up hybrid engine][{"docEngine":"SQLite","binaryEngine":"Filesystem"}]
```

### Job.log
Tạo job, khởi chạy/dừng, và vòng đời job nội bộ.

```
[1763879516.523][2025-11-22 22:31:56][joemax.lan][10176][Job][debug][5][Starting new internal job: imibcblgrjg][{"title":"Worker server upgrade","type":"maint","username":"admin","params":{"targets":["main"],"release":"latest","stagger":30},"stats":{"servers":0,"skipped":0},"details":"","id":"imibcblgrjg","started":1763879516.523,"progress":0}]
```

### Maint.log
Các tác vụ bảo trì và dọn dẹp hàng đêm (reset thống kê hàng ngày, lưu trữ, dọn dẹp).

```
[1763831742.113][2025-11-22 09:15:42][joemax.lan][92938][Maint][debug][6][A new day dawns, resetting daily stats.][]
```

### Monitor.log
Đánh giá monitor, biểu thức, kích hoạt/xóa alert, và gửi dữ liệu.

```
[1763880062.526][2025-11-22 22:41:02][joemax.lan][10341][Monitor][debug][9][Checking alert expression for raspberrypi/disk_usage_root_high: monitors.disk_usage_root >= 90][{"alert":{"id":"disk_usage_root_high","title":"Disk Full","expression":"monitors.disk_usage_root >= 90","message":"Root filesystem is {{pct(monitors.disk_usage_root)}} full.","groups":[],"actions":[],"monitor_id":"disk_usage_root","enabled":true,"samples":1,"notes":"","username":"admin","modified":1754365754,"created":1754365754,"revision":1},"server":"smf4j79snhe","hostname":"raspberrypi","expression":"monitors.disk_usage_root >= 90"}]
```

### Multi.log
Trạng thái cluster đa server và bầu chọn conductor.

```
[1763879905.018][2025-11-22 22:38:25][joemax.lan][10341][Multi][debug][1][We are becoming primary][{"id":"joemax.lan"}]
```

### Scheduler.log
Các tick của scheduler, đánh giá queue, và sự kiện job đến hạn.

```
[1763921040.048][2025-11-23 10:04:00][joemax.lan][14546][Scheduler][debug][5][Ticking scheduler for timestamp: Sun Nov 23 2025 10:04:00 GMT-0800 (Pacific Standard Time)][]
```

### Secret.log
Việc sử dụng secret bởi plugin, hook, và các thành phần khác (không có giá trị secret nào được ghi log).

```
[1763880046.442][2025-11-22 22:40:46][joemax.lan][10341][Secret][debug][1][Using secret zmi94hfmspt (Dev Database) for plugins: pmibcla6mg8][{"secret":{"id":"zmi94hfmspt","title":"Dev Database","enabled":true,"icon":"","notes":"This secret provides access to the dev database.","names":["DB_HOST","DB_PASS","DB_USER"],"events":["emeekm2ablu"],"categories":[],"plugins":["pmibcla6mg8"],"web_hooks":["example_hook"],"username":"admin","modified":1763880046,"created":1763745419,"revision":2},"type":"plugins","id":"pmibcla6mg8"}]
```

### SQLite.log
Các hoạt động và vòng đời của document store dùng SQLite.

```
[1763880095.555][2025-11-22 22:41:35][joemax.lan][10341][SQLite][debug][9][Cached JSON fetch complete: hosts/smf4j79snhe/data][]
```

### Storage.log
Các hoạt động storage trừu tượng trên các engine (get, put, commit, rollback, v.v.).

```
[1763880095.554][2025-11-22 22:41:35][joemax.lan][10341][Storage][transaction][get][users/admin][{"elapsed_ms":0.573}]
```

### Transaction.log
Các transaction ứng dụng ở cấp cao dùng cho auditing và replay (tạo, cập nhật, hoàn thành, v.v.).

```
[1763879911.098][2025-11-22 22:38:31][joemax.lan][10341][Transaction][transaction][server_add][Server connected to the network: raspberrypi (::ffff:10.1.10.92)][{"server_id":"smf4j79snhe","hostname":"raspberrypi","ip":"::ffff:10.1.10.92","groups":["main"],"keywords":["smf4j79snhe"]}]
```

### Unbase.log
Đánh index và bảo trì record nền (ví dụ ghi index activity).

```
[1763879968.522][2025-11-22 22:39:28][joemax.lan][10341][Unbase][debug][6][Insert complete][{"index":"activity","id":"amibcla76g9"}]
```

### User.log
Các sự kiện xác thực user và session.

```
[1763879912.703][2025-11-22 22:38:32][joemax.lan][10341][User][transaction][user_login][admin][{"ip":"127.0.0.1","headers":{"host":"local.xyops.io:5523","accept":"*/*","content-type":"application/json","origin":"https://local.xyops.io:5523","sec-fetch-site":"same-origin","sec-fetch-mode":"cors","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Safari/605.1.15","referer":"https://local.xyops.io:5523/","sec-fetch-dest":"empty","content-length":"2","accept-language":"en-US,en;q=0.9","priority":"u=3, i","accept-encoding":"gzip, deflate, br","connection":"keep-alive","ssl":1,"https":1}}]
```

### WebServer.log
Vòng đời server HTTP/HTTPS, kết nối, và số liệu request.

```
[1763880108.193][2025-11-22 22:41:48][joemax.lan][10341][WebServer][debug][3][HTTPS server on port 5523 has shut down.][{"address":"::","family":"IPv6","port":5523,"ssl":true}]
```

### Workflow.log
Chi tiết thực thi node workflow và điều phối job.

```
[1763841977.078][2025-11-22 12:06:17][joemax.lan][92938][Workflow][debug][6][Workflow is complete][{"job":"jmiapyuj8at"}]
```

### xyOps.log
Vòng đời chính của ứng dụng và khởi động/tắt component.

```
[1763880108.203][2025-11-22 22:41:48][joemax.lan][10341][xyOps][debug][2][Shutdown complete, exiting][]
```

## Log Crash

Nếu PTOps crash hoặc xảy ra exception không được bắt và [log_crashes](config.md#log_crashes) là `true`, một file `crash.log` sẽ được ghi vào [log_dir](config.md#log_dir) chứa timestamp crash gần nhất và stack trace JavaScript. File này là văn bản thuần (không có cột trong dấu ngoặc).

Ví dụ định dạng (stack trace đã cắt ngắn):

```
2025-11-22 22:41:48 Uncaught exception: Error: Something bad happened
    at Object.<anonymous> (app.js:123:45)
    at Module._compile (node:internal/modules/cjs/loader:1356:14)
    ...
```

## Nightly Archival

xyOps automatically archives server logs every night at midnight (local server time):

- All `.log` files in [log_dir](config.md#log_dir) are compressed with gzip and copied to a date-based path.
- The destination is controlled by [log_archive_path](config.md#log_archive_path), which supports date/time placeholders.

Default path pattern:

```
logs/archives/[yyyy]/[mm]/[dd]/[filename]-[yyyy]-[mm]-[dd].log.gz
```

Where `[filename]` expands to the source filename without the extension (e.g., `API` for `API.log`). The Maintenance component performs this task nightly; see `Maint.log` for status entries.

If you prefer a single combined log (e.g., `xyops.log`), set [log_filename](config.md#log_filename) accordingly; the nightly archival will still archive that single file using the same pattern.
