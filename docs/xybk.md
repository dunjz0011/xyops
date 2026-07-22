# Định Dạng Backup của PTOps

## Tổng Quan

Tài liệu này mô tả Định Dạng Backup của PTOps (XYBK) v1.0, dùng để xuất/nhập dữ liệu hàng loạt từ hệ thống PTOps. Định dạng này hỗ trợ chọn các nhóm dữ liệu (list, database index, và extra), hoặc bao gồm tất cả. File ở dạng [NDJSON](https://github.com/ndjson/ndjson-spec) có hỗ trợ dòng comment và dòng trống, thường được đóng gói bằng [Gzip](https://en.wikipedia.org/wiki/Gzip) để truyền tải.

- **Tiêu đề**: Định Dạng Backup của PTOps
- **ID**: XYBK
- **Phiên bản**: 1.0
- **Ngày**: 12 tháng 12, 2025
- **Tác giả**: Joseph Huckaby (PixlCore)

XYBK chủ yếu được dùng bởi tính năng "Export Data" và "Import Data" trong Admin. Bộ xuất (exporter) truyền một file NDJSON đã nén Gzip đến client, và bộ nhập (importer) chấp nhận cả NDJSON thuần hoặc NDJSON đóng gói Gzip.

## Cấu Trúc File

Một file XYBK là một chuỗi dòng văn bản UTF-8. Ba loại dòng được cho phép:

- **Comment**: Bất kỳ dòng nào bắt đầu bằng `#` là comment và bị importer bỏ qua.
- **Trống**: Dòng trống hoặc chỉ có khoảng trắng được cho phép và bị bỏ qua.
- **Record**: Một object JSON trên một dòng (NDJSON). Các dòng này được xử lý theo thứ tự.

File bắt đầu bằng một header ngắn dưới dạng khối comment (chỉ để con người dễ đọc):

```
# PTOps Data Export v1.0
# Hostname: [host]
# Date/Time: [string]
# Format: NDJSON
```

Sau header, file chứa một hoặc nhiều phần được gán nhãn (dòng comment) và các record NDJSON. Header của các phần chỉ mang tính tham khảo và bị importer bỏ qua. Importer chỉ xử lý các dòng JSON bắt đầu bằng `{`.

## Các Loại Record

Mỗi record NDJSON phải là chính xác một trong các dạng sau:

### Storage Put

```json
{ "key": "<storage_key>", "value": /* json_or_base64 */ }
```

- Ghi trực tiếp vào [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage) dưới dạng "put" key/value.
- Đối với key nhị phân, `value` chứa một chuỗi Base64. Khi nhập, việc phát hiện nhị phân là tự động dựa trên pattern của key, và value được decode lại thành raw byte.
- Đối với key JSON, `value` là một object JSON được lưu nguyên bản.

### Storage Command

```json
{ "cmd": "<method>", "args": [ /* arg1, arg2, ... */ ] }
```

- Gọi một API storage trên [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage), ví dụ `listDelete`.
- Các tham số được truyền nguyên bản. Importer tự thêm callback riêng của nó bên trong.
- Được dùng bởi export để chuẩn bị trạng thái cho việc tái tạo lại (ví dụ xoá các trang của list trước khi tạo lại chúng).

### Database Record

```json
{ "index": "<index_id>", "id": "<record_id>", "record": { /* ... */ } }
```

- Chèn một record database vào [Unbase](https://github.com/jhuckaby/pixl-server-unbase) qua `unbase.insert(index, id, record)`.
- Ngữ nghĩa là "tạo hoặc thay thế" theo ID.

## Các Phần (Sections)

Bộ xuất thêm các header phần dạng comment để nhóm các dòng liên quan. Các header này chỉ mang tính thông tin và bị bỏ qua khi nhập. Bạn có thể gặp các header phần sau:

- `# List: <key>`
- `# Database Index: <index> (<query>)`
- `# User Data:`
- `# Bucket Data`
- `# Bucket Files`
- `# Encrypted Secret Data`
- `# Job Files (<query>)`
- `# Ticket Files (<query>)`
- `# Monitor Timeline Data (<query>)`

### Lists

Nhiều hệ thống con của PTOps được mô hình hoá dưới dạng "List" của storage (mảng có phân trang). Xem [Lists](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Lists.md) để biết chi tiết nội bộ về list. Bản export bao gồm metadata của list và toàn bộ các trang. Định dạng như sau:

Xoá list trước để dọn chỗ cho list mới sắp đến:

```json
{ "cmd": "listDelete", "args": [ "<key>", false ] }
```

Thêm header của list (key/value):

```json
{ "key": "<key>", "value": { "page_size": 100, "first_page": 1, "last_page": 5, "length": 500, "type": "list" } }
```

Thêm các trang của list (key/value):

```json
{ "key": "<key>/<page>", "value": { "type": "list_page", "items": [ /* ... */ ] } }
```

Mảng `items` chứa các item thực tế của list. Các trang được xuất từ `first_page` đến `last_page` (bao gồm cả hai).

Các key list thường được xuất dưới `global/` bao gồm:

- `alerts`, `api_keys`, `buckets`, `categories`, `channels`, `events`, `groups`, `monitors`, `plugins`, `secrets`, `tags`, `users`, `roles`, `web_hooks`

Lưu ý: Các record tài khoản người dùng không được lưu trong `global/users` (list đó chỉ chứa danh sách roster). Các record người dùng thực tế được xuất dưới `users/<username>` (xem "User Data" bên dưới).

### Database Indexes

Bản export có thể bao gồm toàn bộ index Unbase, có thể lọc theo query. Mỗi record được xuất dưới dạng:

```json
{ "index": "<index_id>", "id": "<record_id>", "record": { /* ... */ } }
```

Các ID index phổ biến bao gồm: `alerts`, `jobs`, `servers`, `snapshots`, `activity`, `tickets`.

Xem [Unbase](https://github.com/jhuckaby/pixl-server-unbase) để biết thêm chi tiết.

### User Data

Các record tài khoản người dùng được xuất dưới dạng storage key:

- `users/<normalized_username>` → `{ ...user record... }`

Nếu extra "User Avatars" được chọn, các key nhị phân sau cũng có thể được bao gồm (dạng Base64):

- `users/<normalized_username>/avatar/64.png`
- `users/<normalized_username>/avatar/256.png`

Mật khẩu trong record người dùng được lưu dưới dạng hash [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) có salt và được xuất y như đã lưu.

### Buckets

Nếu list Buckets được chọn, bộ xuất cũng bao gồm dữ liệu bucket và có thể bao gồm payload file, tuỳ vào extra:

- `key: buckets/<bucket_id>/data` (JSON) chứa object metadata/data cho từng bucket.
- `key: buckets/<bucket_id>/files` (JSON) chứa từng file payload theo storage path của nó. Payload file là Base64.

### Secrets

Metadata của secret vault nằm trong list `global/secrets` (được xuất như mọi list khác). Các payload secret thực tế được xuất dưới:

- `key: secrets/<secret_id>` → Value là blob đã mã hoá (như được lưu). Nội dung là dữ liệu mã hoá dạng Base64; secret không được xuất dưới dạng plaintext.

### Job và Ticket Files/Logs

Nếu được chọn qua extra, các file đính kèm của job và ticket được xuất theo key với payload Base64. Đối với job, log đã nén cũng có thể được xuất:

- File job: `key: <file_path>` cho mỗi file trong `files[]` của job (tuỳ theo giới hạn kích thước tối đa).
- Log job: `key: logs/jobs/<job_id>/log.txt.gz` nếu tồn tại và dưới giới hạn kích thước.
- File ticket: `key: <file_path>` cho mỗi file trong `files[]` của ticket (tuỳ theo giới hạn kích thước tối đa).

### Monitor Timeline Data

Dữ liệu chuỗi thời gian (time-series) của monitor server được lưu dưới dạng list tại `timeline/<server_id>/<system_id>`. Khi được bao gồm, bộ xuất sẽ xuất mỗi timeline như một List thông thường (xem [Lists](#lists)).

## Chọn Dữ Liệu

UI hiển thị ba nhóm lựa chọn tương ứng với các loại item được xuất:

- **Lists**: Một hoặc nhiều list chuẩn dưới `global/` (xem trên). Chọn `users` cũng sẽ kích hoạt xuất "User Data" cho các record `users/<username>`. Chọn `buckets` sẽ kích hoạt "Bucket Data". Chọn `secrets` sẽ kích hoạt "Encrypted Secret Data".
- **Indexes**: Một hoặc nhiều index Unbase theo ID (có thể lọc theo query).
- **Extras**: Payload và chuỗi thời gian tuỳ chọn:
  - `job_files`
  - `job_logs`
  - `bucket_files`
  - `ticket_files`
  - `monitor_data`
  - `stat_data` 
  - `user_avatars`

Bộ xuất có thể được yêu cầu bao gồm "tất cả" trong bất kỳ nhóm nào. Bên trong, các lựa chọn này được mở rộng thành một luồng các loại record đã mô tả trên.

## Nén Dữ Liệu

Bản export được truyền dạng file Gzip với tên tương tự `ptops-data-export-YYYY-MM-DD-<id>.txt.gz`. Bộ nhập chấp nhận cả file NDJSON thuần `.txt` hoặc file `.txt.gz` đã nén Gzip.

## Đặc Điểm An Toàn

- **API Keys**: Chỉ hash có salt được xuất; plaintext của API key không bao giờ được xuất. Trường `key` là một digest SHA-256 có salt được lưu lúc tạo.
- **Secrets**: Payload secret được xuất dưới dạng blob mã hoá (Base64); plaintext không bao giờ được xuất.
- **Users**: Mật khẩu được lưu và xuất dưới dạng hash bcrypt có salt. Không có mật khẩu plaintext nào được xuất.

## Ví Dụ

Đoạn ví dụ hiển thị xuất list, API key, và một record database:

```
# PTOps Data Export v1.0
# Hostname: joemax.xyops.io
# Date/Time: Tue Nov 18 2025 12:01:27 GMT-0800 (Pacific Standard Time)
# Format: NDJSON

# List: global/alerts
{"cmd":"listDelete","args":["global/alerts",false]}
{"key":"global/alerts","value":{"page_size":100,"first_page":0,"last_page":0,"length":5,"type":"list"}}
{"key":"global/alerts/0","value":{"type":"list_page","items":[{"id":"load_avg_high","title":"High CPU Load", ...}]}}

# List: global/api_keys
{"cmd":"listDelete","args":["global/api_keys",false]}
{"key":"global/api_keys","value":{"page_size":100,"first_page":0,"last_page":0,"length":2,"type":"list"}}
{"key":"global/api_keys/0","value":{"type":"list_page","items":[{"key":"<salted_sha256>","active":1, ...}]}}

# Database Index: tickets (*)
{"index":"tickets","id":"tmhzbmbagig","record":{"subject":"Alert: High Active Jobs on raspberrypi", ...}}
```

## Quy Tắc Parse

- Comment và dòng trống bị bỏ qua. Chỉ các dòng bắt đầu bằng `{` mới được parse.
- Các dòng được xử lý theo thứ tự. Command có thể chuẩn bị trạng thái (ví dụ xoá list) trước các lệnh put tiếp theo.
- Record key/value được ghi qua `storage.put(key, value)`. Key nhị phân được tự động decode Base64 khi nhập.
- Record database được chèn qua `unbase.insert(index, id, record)`.
- Storage command gọi phương thức được đặt tên trên storage engine với các tham số đã cung cấp.
- Bộ nhập truyền và kiểm tra từng dòng, thu thập tối đa 100 lỗi để báo cáo, và tiếp tục vượt qua các lỗi không nghiêm trọng.

## Ghi Chú Về Lists và Storage

PTOps lưu hầu hết các object cấu hình dưới dạng List. Tài liệu tham khảo hữu ích:

- [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage)
- [Lists](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Lists.md)
- [Unbase](https://github.com/jhuckaby/pixl-server-unbase)

## Phiên Bản

Tài liệu này mô tả XYBK v1.0. Bộ xuất phát ra `# PTOps Data Export v1.0` trong header. Các phiên bản tương lai có thể thêm các header phần và dạng record mới, nhưng bộ nhập luôn bỏ qua comment và chỉ dựa vào ba loại record NDJSON được định nghĩa ở đây.
