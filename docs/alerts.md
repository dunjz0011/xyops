# Alerts

## Tổng Quan

Alert đánh giá dữ liệu server thời gian thực và kích hoạt action khi điều kiện được đáp ứng. Trong PTOps, một alert được định nghĩa một lần (là "definition") và có thể kích hoạt nhiều lần trên các server (mỗi lần kích hoạt là một "invocation"). Alert được đánh giá mỗi phút trên conductor sử dụng [ServerMonitorData](data.md#servermonitordata) gần nhất được thu thập từ mỗi server.

Dùng alert để phát hiện các điều kiện hệ thống (ví dụ CPU cao, ít bộ nhớ, đầy đĩa, tăng vọt job), thông báo cho team, gắn context qua snapshot, mở ticket, chạy job, và tuỳ chọn giới hạn hoặc hủy job trên các server bị ảnh hưởng.

## Khái Niệm

- **Definition:** Cấu hình chỉ định điều kiện kích hoạt và action.
- **Invocation:** Một lần kích hoạt riêng lẻ đối với một server. Được lưu trong database và hiển thị trong view Alerts.
- **Nhịp đánh giá:** Mỗi phút một lần cho mỗi server, cùng với việc lấy mẫu monitor.
- **Phạm vi:** Theo server group. Để trống để áp dụng cho tất cả group.
- **Warm-up / cool-down:** Tuỳ chọn yêu cầu N lần đánh giá đúng liên tiếp trước khi kích hoạt, và N lần đánh giá sai liên tiếp trước khi xoá.
- **Actions:** Thực thi khi alert kích hoạt và/hoặc được xoá. Action có thể định nghĩa trên alert, được bổ sung bởi group, và mở rộng với giá trị mặc định toàn hệ thống.
- **Kiểm soát job:** Tuỳ chọn ngăn job mới khởi chạy khi đang kích hoạt, hoặc thậm chí hủy tất cả job đang chạy khi alert kích hoạt.

## Cách Alert Được Đánh Giá

Mỗi phút dữ liệu server đến:

1. PTOps đánh giá từng alert definition đang bật mà phạm vi group của nó khớp với server.
2. Expression của alert (định dạng JavaScript) chạy trên ảnh chụp [ServerMonitorData](data.md#servermonitordata) hiện tại.
3. Nếu expression trả về true, bộ đếm mẫu nội bộ của alert tăng lên. Nếu false và trước đó đã tăng, bộ đếm giảm về không.
4. Khi bộ đếm đầu tiên đạt số mẫu tối đa, một invocation được tạo và action chạy. Khi bộ đếm sau đó trở về không, invocation được xoá và action xoá chạy.

Lưu ý:

- Expression được biên dịch trước; lỗi cú pháp bị từ chối lúc tạo/cập nhật và trong dialog/API Test.
- Message của alert được đánh giá lại mỗi phút khi đang kích hoạt, nên macro phản ánh giá trị server hiện tại.
- Invocation đang kích hoạt được giữ mới khi dữ liệu đến. Invocation cũ tự động hết hạn nếu không thấy cập nhật (ví dụ server offline).

## Alert Expression

Một alert expression được đánh giá dùng [Định Dạng Expression của PTOps](xyexp.md), với [ServerMonitorData](data.md#servermonitordata) hiện tại làm context. Các điểm truy cập phổ biến bao gồm:

- `cpu`: Số liệu CPU và thông tin phần cứng.
- `memory`: Tổng/khả dụng bộ nhớ, v.v.
- `load`: Load average trung bình 1/5/15 phút.
- `monitors`: Giá trị từ các monitor đã cấu hình (giá trị tuyệt đối).
- `deltas`: Delta được tính cho monitor dạng counter kể từ mẫu trước (mỗi phút theo mặc định).
- `jobs`: Số lượng job đang chạy trên server.

Ví dụ:

```js
monitors.load_avg >= (cpu.cores + 1)
```

Điều này kích hoạt nếu load average 1 phút lớn hơn hoặc bằng số lõi CPU cộng một.

Ví dụ delta (cho monitor dạng counter):

```js
deltas.os_bytes_out_sec >= 33554432
```

Các hàm hỗ trợ hữu ích có sẵn trong expression và macro message:

- `min(a, b)`, `max(a, b)`
- `integer(x)`, `float(x)`
- `bytes(x)` hiển thị byte dễ đọc
- `number(x)` hiển thị số đã địa phương hoá
- `pct(x)` hiển thị phần trăm
- `stringify(obj)` chuyển giá trị thành chuỗi JSON
- `find(array, key, substr)` lọc phần tử mảng mà `item[key]` chứa `substr`

Xem [Định Dạng Expression của PTOps](xyexp.md) để biết thêm chi tiết.

Mẹo:

- Dùng `monitors.MONITORID` cho giá trị tuyệt đối và `deltas.MONITORID` cho tốc độ mỗi phút khi monitor đại diện cho một counter.
- Đề phòng giá trị thiếu bằng cách dùng giá trị mặc định hợp lý, ví dụ `integer(monitors.foo || 0) > 10`.

## Alert Message

Message của alert là một chuỗi với macro `{{ ... }}` được đánh giá trên cùng context [ServerMonitorData](data.md#servermonitordata) dùng cho expression. Điều này cho phép bạn đưa thông tin chi tiết đã định dạng, theo context vào thông báo, ticket và log.

Ví dụ:

```
CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)
```

Tất cả hàm hỗ trợ được liệt kê dưới Alert Expression cũng có sẵn trong macro. Bất kỳ macro có giá trị object nào sẽ được chuyển thành chuỗi JSON.

Các biến bổ sung được chèn vào khi action chạy (chủ yếu dùng trong template):

- `def`: Đối tượng alert definition (`def.title`, `def.notes`, v.v.).
- `alert`: Đối tượng alert invocation (`alert.id`, `alert.message`, v.v.).
- `nice_*`: Chuỗi thân thiện cho host, IP, CPU, OS, memory, uptime, group, notes, v.v.
- `links`: Link trực tiếp `server_url` và `alert_url`.

## Tạo và Sửa Alert

Nhấn vào "Alert Setup" ở sidebar. Việc tạo và sửa yêu cầu privilege phù hợp. Form thu thập:

- **Title**: Tên hiển thị cho alert.
- **Status**: Bật/tắt thông báo và action.
- **Icon**: Material Design Icon tuỳ chọn cho alert.
- **Server Groups**: Một hoặc nhiều group nơi alert áp dụng. Để trống cho tất cả group.
- **Expression**: Điều kiện kích hoạt được đánh giá mỗi phút. Dùng Server Data Explorer để khám phá các đường dẫn.
- **Message**: Văn bản với macro `{{macro}}` cho context động. Được đánh giá khi kích hoạt và mỗi phút khi đang kích hoạt.
- **Samples**: Số phút liên tiếp phải đánh giá đúng để kích hoạt; cũng dùng làm cool-down để xoá.
- **Overlay**: Monitor tuỳ chọn để phủ chú thích alert lên biểu đồ.
- **Job Limit**: Khi đang kích hoạt, ngăn job mới khởi chạy trên server.
- **Job Abort**: Khi kích hoạt, hủy tất cả job đang chạy trên server.
- **Alert Actions**: Action tuỳ chọn để chạy khi `alert_new` và/hoặc `alert_cleared`.
- **Notes**: Văn bản tuỳ chọn được đưa vào email và các thông báo khác.

Kiểm tra: Dùng nút "Test..." để đánh giá Expression và Message hiện tại trên một server thực đã chọn. Dialog hiển thị liệu nó có kích hoạt ngay bây giờ không và xem trước message đã tính toán.

## Action Khi Kích Hoạt và Xoá

Khi một alert kích hoạt (`alert_new`) và khi nó được xoá (`alert_cleared`), PTOps thực thi action song song từ ba nguồn, loại bỏ trùng lặp theo loại/target:

- **Action của alert**: Cấu hình trên chính alert definition.
- **Action của group**: Mỗi server group khớp có thể góp thêm action.
- **Action toàn hệ thống**: Từ `config.json` → `alert_universal_actions` (mặc định là một `snapshot` khi `alert_new`).

Các loại action được hỗ trợ trong alert:

- **Email**: Đến các user chỉ định và/hoặc địa chỉ tuỳ chỉnh.
- **Channel**: Kích hoạt một notification channel (một bó có sẵn như user, web hook, v.v.).
- **Run Job**: Khởi chạy một job theo event với tham số tuỳ chọn.
- **Create Ticket**: Mở hoặc cập nhật một ticket gắn với alert.
- **Web Hook**: Kích hoạt một web hook gửi ra đã cấu hình sẵn với payload dạng template.
- **Plugin**: Chạy một plugin tuỳ chỉnh với tham số.
- **Snapshot**: Chụp ảnh trạng thái server tại một thời điểm. Lưu ý: một snapshot được bao gồm theo mặc định qua action toàn hệ thống.

Điều kiện action là `alert_new` hoặc `alert_cleared`. Bạn có thể gắn nhiều action cho mỗi điều kiện.

### Action Toàn Hệ Thống Cho Alert

Dùng đối tượng cấu hình [alert_universal_actions](config.md#alert_universal_actions), bạn có thể thêm action tuỳ chỉnh nên luôn chạy cho tất cả alert (khi alert kích hoạt và/hoặc khi nó xoá). Theo mặc định, PTOps đi kèm action [Snapshot](actions.md#snapshot) trên tất cả điều kiện `alert_new`:

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

Thêm bao nhiêu action toàn hệ thống bạn muốn vào mảng này. Chỉ cần nhớ rằng thuộc tính `condition` cần là `alert_new` hoặc `alert_cleared` cho alert.

## Kiểm Soát Job Trong Khi Alert Kích Hoạt

- **Limit Jobs**: Khi alert đang kích hoạt trên một server, server đó bị loại khỏi việc lập lịch job (ngăn job mới khởi chạy ở đó). Job cha của workflow được miễn trừ khỏi giới hạn này.
- **Abort Jobs**: Khi alert kích hoạt, tất cả job đang chạy trên server bị ảnh hưởng sẽ bị hủy ngay lập tức.

Cả hai đều là tuỳ chọn độc lập trên alert definition.

## Ví Dụ

Cài đặt mặc định bao gồm một số ví dụ alert:

| Tiêu Đề Alert     | Expression                                 | Message |
|------------------|--------------------------------------------|---------|
| High CPU Load    | `monitors.load_avg >= (cpu.cores + 1)`     | CPU load average is too high: `{{float(monitors.load_avg)}}` (`{{cpu.cores}}` CPU cores) |
| Low Memory       | `memory.available < (memory.total * 0.05)` | Less than 5% of total memory is available (`{{bytes(memory.available)}}` of `{{bytes(memory.total)}}`) |
| High I/O Wait    | `monitors.io_wait >= 75`                   | Disk I/O wait is too high: `{{pct(monitors.io_wait)}}` |
| Disk Full        | `monitors.disk_usage_root >= 90`           | Root filesystem is `{{pct(monitors.disk_usage_root)}}` full. |
| High Active Jobs | `monitors.active_jobs >= 50`               | Active job count is too high: `{{number(monitors.active_jobs)}}` |

## Xem và Tìm Kiếm Alert

- **Alert đang kích hoạt**: Hiển thị ở bộ đếm header và tab Alerts. Mỗi cái bao gồm message đã đánh giá, context server, link snapshot và job/ticket liên quan.
- **Timeline**: Nếu `monitor_id` được đặt, chú thích alert hiển thị trên biểu đồ monitor tương ứng.
- **Tìm kiếm lịch sử**: Tìm alert lịch sử trên trang "Alerts".

## Tóm Tắt API

Xem [Alerts](api.md#alerts) để biết chi tiết đầy đủ. Điểm chính:

- `get_alerts`: Liệt kê tất cả alert definition.
- `get_alert`: Lấy một definition duy nhất theo ID.
- `create_alert` / `update_alert` / `delete_alert`: Quản lý definition.
- `test_alert`: Biên dịch và đánh giá một expression/message trên một server.
- `search_alerts`: Truy vấn invocation alert lịch sử và đang kích hoạt.

## Thực Hành Tốt Nhất

- Điều chỉnh `samples` để cân bằng giữa nhiễu và độ nhạy phản hồi. Đối với số liệu dao động mạnh, yêu cầu nhiều mẫu hơn.
- Ưu tiên ngưỡng tương đối khi có thể (ví dụ so sánh load với `cpu.cores`).
- Dùng `bytes()`/`pct()`/`number()` để tạo message dễ đọc trong thông báo.
- Phủ alert lên các monitor mà user đã theo dõi để cung cấp context.
- Dùng action alert cấp group cho phản hồi chuẩn (ví dụ page cho on-call channel) và giữ action riêng cho từng alert tập trung vào chi tiết cụ thể.
- Xem xét giới hạn job cho các điều kiện có thể làm giảm độ tin cậy runtime (ví dụ đầy đĩa, I/O wait cao).

## Privileges

- Tạo: [create_alerts](privileges.md#create_alerts)
- Sửa/Test: [edit_alerts](privileges.md#edit_alerts)
- Xóa: [delete_alerts](privileges.md#delete_alerts)

Người dùng không có các privilege này vẫn có thể đọc definition và xem alert đang kích hoạt với session hoặc API Key hợp lệ.

## Xem Thêm

- Cấu trúc dữ liệu: [Alert](data.md#alert) và [AlertInvocation](data.md#alertinvocation)
- API: [Alerts](api.md#alerts)
- Context dữ liệu giám sát: [ServerMonitorData](data.md#servermonitordata)
