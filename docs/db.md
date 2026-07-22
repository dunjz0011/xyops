# Database

Tài liệu này mô tả schema database của PTOps. Nó liệt kê mọi index (bảng), toàn bộ các cột được đánh index, và các sorter chuyên dụng dùng để sắp xếp kết quả.

## Tổng Quan

PTOps sử dụng [Unbase](https://github.com/jhuckaby/pixl-server-unbase), nằm trên [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage) và hệ thống con [Indexer](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md) của nó. Bản ghi được lưu dưới dạng JSON trong một backend key/value (mặc định là SQLite), và Unbase xây dựng các index và sorter có thể tìm kiếm được từ các định nghĩa field đã cấu hình. Truy vấn hỗ trợ cả cú pháp đơn giản "field:words" và cú pháp cấu trúc [PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries).

Ghi chú:

- Type đề cập đến kiểu indexer: word (mặc định, full-text/theo từ), number, hoặc date. Trừ khi được chỉ định khác, một field sẽ là word index.
- Các field date/number có thể được lưu với độ chính xác giảm để tăng hiệu năng (ví dụ chia cho 3600 để index theo cụm giờ).

## Jobs

Bản ghi job đã hoàn thành (xem [Job](data.md#job)).

Các Cột Được Index:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `code` | [Job.code](data.md#job-code) | Word | Mã kết quả của job (0 là thành công, khác 0 là thất bại; các giá trị đặc biệt như `warning`, `critical`, `abort`). |
| `date` | [Job.completed](data.md#job-completed) | Number | Timestamp hoàn thành, được index ở độ chính xác giờ. |
| `source` | [Job.source](data.md#job-source) | Word | Nguồn khởi chạy (scheduler, plugin, key, user, action, alert, workflow). |
| `tags` | [Job.tags](data.md#event-tags) | Word | Các tag được gán cho job. |
| `event` | [Job.event](data.md#job-event) | Word | ID event đã tạo ra job. |
| `category` | [Job.category](data.md#event-category) | Word | ID category của event, được sao chép vào job. |
| `plugin` | [Event.plugin](data.md#event-plugin) | Word | ID plugin đã thực thi job. |
| `server` | [Job.server](data.md#job-server) | Word | ID server được chọn để chạy job. |
| `groups` | [Job.groups](data.md#job-groups) | Word | Các ID group server, được sao chép vào job. |
| `workflow` | [Job.workflow](data.md#job-workflow) | Word | Khi là một phần của workflow, ID event của workflow. |
| `tickets` | [Job](data.md#job-tickets) | Word | Các ID ticket liên kết với job. |

Sorters:

| Sorter ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `completed` | [Job.completed](data.md#job-completed) | Number | Sắp xếp theo timestamp hoàn thành của job. |
| `elapsed` | [Job.elapsed](data.md#job-elapsed) | Number | Sắp xếp theo thời lượng chạy job (giây). |

## Alerts

Bản ghi lần kích hoạt alert (xem [AlertInvocation](data.md#alertinvocation)).

Các Cột Được Index:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `active` | [AlertInvocation.active](data.md#alertinvocation-active) | Word | Alert có đang hoạt động hay không (`true` hoặc `false`). |
| `alert` | [AlertInvocation.alert](data.md#alertinvocation-alert) | Word | ID định nghĩa alert. |
| `groups` | [AlertInvocation.groups](data.md#alertinvocation-groups) | Word | Các group mà server thuộc về. |
| `server` | [AlertInvocation.server](data.md#alertinvocation-server) | Word | ID server liên kết với lần kích hoạt. |
| `start` | [AlertInvocation.date](data.md#alertinvocation-date) | Number | Timestamp bắt đầu, được index ở độ chính xác giờ. |
| `end` | [AlertInvocation.modified](data.md#alertinvocation-modified) | Number | Thời gian sửa đổi cuối, được index ở độ chính xác giờ. |
| `jobs` | [AlertInvocation.jobs](data.md#alertinvocation-jobs) | Word | Các ID job liên quan. |
| `tickets` | [AlertInvocation.tickets](data.md#alertinvocation-tickets) | Word | Các ID ticket liên quan. |

## Snapshots

Bản ghi snapshot của server và group (xem [Snapshot](data.md#snapshot)).

Các Cột Được Index:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `type` | [Snapshot.type](data.md#snapshot-type) | Word | Loại snapshot: `server` hoặc `group`. |
| `source` | [Snapshot.source](data.md#snapshot-source) | Word | Nguồn gốc snapshot: `alert`, `watch`, `user`, hoặc `job`. |
| `server` | [Snapshot.server](data.md#snapshot-server) | Word | ID server cho snapshot cấp độ server. |
| `groups` | [Snapshot.groups](data.md#snapshot-groups) | Word | Các group liên kết vào thời điểm chụp snapshot. |
| `date` | [Snapshot.date](data.md#snapshot-date) | Number | Timestamp snapshot, được index ở độ chính xác giờ. |
| `alerts` | [Snapshot.alerts](data.md#snapshot-alerts) | Word | Các ID lần kích hoạt alert đang hoạt động vào thời điểm chụp snapshot. |
| `jobs` | [Snapshot.jobs](data.md#snapshot-jobs) | Word | Các ID job đang hoạt động vào thời điểm chụp snapshot. |

## Servers

Bản ghi server (xem [Server](data.md#server)).

Các Cột Được Index:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `groups` | [Server.groups](data.md#server-groups) | Word | Các ID group (bật master list). |
| `created` | [Server.created](data.md#server-created) | Number | Timestamp tạo, được index ở độ chính xác giờ. |
| `modified` | [Server.modified](data.md#server-modified) | Number | Timestamp sửa đổi cuối, được index ở độ chính xác giờ. |
| `keywords` | [Server.keywords](data.md#server-keywords) | Word | Từ khoá tìm kiếm (tối thiểu 1, tối đa 64 ký tự mỗi từ). |
| `os_platform` | [Server.info.os.platform](data.md#server-info) | Word | Nền tảng OS (đã lọc alphanumeric; master list/labels). |
| `os_distro` | [Server.info.os.distro](data.md#server-info) | Word | Bản phân phối OS (đã lọc alphanumeric; master list/labels). |
| `os_release` | [Server.info.os.release](data.md#server-info) | Word | Phiên bản/release OS (đã lọc alphanumeric; master list/labels). |
| `os_arch` | [Server.info.os.arch](data.md#server-info) | Word | Kiến trúc CPU (đã lọc alphanumeric; master list/labels). |
| `cpu_virt` | [Server.info.virt.vendor](data.md#server-info) | Word | Nhà cung cấp virtualization (đã lọc alphanumeric; master list/labels). |
| `cpu_brand` | [Server.info.cpu.combo](data.md#server-info) | Word | Nhà cung cấp/thương hiệu CPU (đã lọc alphanumeric; master list/labels). |
| `cpu_cores` | [Server.info.cpu.cores](data.md#server-info) | Word | Số core CPU (đã lọc alphanumeric; master list/labels). |

## Activity

Log hoạt động của user/hệ thống (xem [Activity](data.md#activity)).

Các Cột Được Index:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `action` | [Activity.action](data.md#activity-action) | Word | Định danh hành động của hoạt động. |
| `keywords` | [Activity.keywords](data.md#activity-keywords) | Word | Từ khoá tìm kiếm (ID, username, IP). |
| `date` | [Activity.epoch](data.md#activity-epoch) | Number | Timestamp hoạt động, được index ở độ chính xác giờ. |

## Tickets

Bản ghi ticket (xem [Ticket](data.md#ticket)).

Các Cột Được Index:

| Column ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `type` | [Ticket.type](data.md#ticket-type) | Word | Loại ticket (`issue`, `feature`, `change`, `maintenance`, `question`, `other`). |
| `num` | [Ticket.num](data.md#ticket-num) | Number | Số ticket được gán tự động. |
| `status` | [Ticket.status](data.md#ticket-status) | Word | Trạng thái ticket (`open`, `closed`, `draft`). |
| `category` | [Ticket.category](data.md#ticket-category) | Word | ID category. |
| `username` | [Ticket.username](data.md#ticket-username) | Word | Username người tạo (đã lọc alphanumeric). |
| `assignees` | [Ticket.assignees](data.md#ticket-assignees) | Word | Người được giao (mảng đã lọc alphanumeric). |
| `cc` | [Ticket.cc](data.md#ticket-cc) | Word | Người dùng được CC (mảng đã lọc alphanumeric). |
| `jobs` | [Ticket](data.md#ticket) | Word | Các ID job liên quan. |
| `tags` | [Ticket.tags](data.md#ticket-tags) | Word | Các ID tag (bật master list). |
| `created` | [Ticket.created](data.md#ticket-created) | Number | Timestamp tạo, được index ở độ chính xác giờ. |
| `modified` | [Ticket.modified](data.md#ticket-modified) | Number | Timestamp sửa đổi cuối, được index ở độ chính xác giờ. |
| `due` | [Ticket.due](data.md#ticket-due) | Date | Ngày hết hạn. |
| `server` | [Ticket.server](data.md#ticket-server) | Word | ID server liên kết. |
| `subject` | [Ticket.subject](data.md#ticket-subject) | Word | Tóm tắt ngắn (FTS; bật stemming). |
| `body` | [Ticket.body](data.md#ticket-body) | Word | Tìm kiếm full-text trên username, subject và body (đã lọc markdown; bật stemming). |
| `changes` | [Ticket.changes](data.md#ticket-changes) | Word | Tìm kiếm full-text trên nội dung change log (đã lọc markdown; bật stemming). |

Sorters:

| Sorter ID | Source | Type | Description |
|-----------|--------|------|-------------|
| `num` | [Ticket.num](data.md#ticket-num) | Number | Sắp xếp theo số ticket. |
| `modified` | [Ticket.modified](data.md#ticket-modified) | Number | Sắp xếp theo timestamp sửa đổi cuối. |

## Thuộc Tính Cột

Đây là các thuộc tính field chung được indexer hỗ trợ (xem tài liệu Indexer để biết chi tiết đầy đủ):

- `id`: ID cột dùng trong tìm kiếm (ví dụ `status:open`).
- `source`: Đường dẫn phân tách bằng slash đến field dữ liệu nguồn (có thể tham chiếu các thuộc tính lồng nhau hoặc nhiều nguồn cho FTS).
- `type`: Kiểu index cho field hoặc sorter. Bỏ qua nếu là word index; có thể là `number` hoặc `date` cho field, và `number` hoặc `string` cho sorter.
- `divide`: Với number, chia giá trị trước khi index. Với date, giá trị phổ biến `3600` để index ở độ chính xác giờ nhằm cải thiện hiệu năng.
- `min_word_length` / `max_word_length`: Giới hạn độ dài token trong word index.
- `use_remove_words`: Bật/tắt danh sách từ loại bỏ tuỳ chỉnh.
- `use_stemmer`: Bật Porter stemming cho word index.
- `filter`: Áp dụng một filter trước khi index (ví dụ `alphanum`, `alphanum_array`, `markdown`).
- `master_list`: Duy trì một danh sách chủ (master list) các giá trị được index duy nhất để tổng hợp nhanh.
- `master_labels`: Duy trì một danh sách chủ các giá trị thô duy nhất (trước khi lọc).
