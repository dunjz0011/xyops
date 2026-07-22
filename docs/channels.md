# Channels

## Tổng Quan

Notification Channel trong PTOps cho phép bạn đóng gói nhiều đích thông báo và action theo sau dưới một tên tái sử dụng duy nhất. Thay vì gắn từng email, web hook, hoặc action run-event riêng lẻ ở mọi nơi, bạn tham chiếu một channel từ event/workflow hoặc alert action của mình và PTOps thực thi các action đã cấu hình của channel cùng nhau.

Trường hợp sử dụng điển hình: Tạo một channel tên "Severity 1" gửi email cho team on-call của bạn, gửi web hook Slack, chạy một event khắc phục (remediation), và phát âm báo động trên UI cho các user đang kết nối.

Tài liệu này giải thích cách channel hoạt động, nơi chúng được sử dụng, chúng có thể làm gì, và cung cấp một ví dụ cấu hình.

## Điểm Chính

- Channel là các bó thông báo/action tái sử dụng mà bạn định nghĩa một lần và tham chiếu từ action.
- Gắn một channel qua action loại "Notify Channel" trên event/workflow hoặc alert. Xem [Actions](actions.md).
- Khi một channel chạy, PTOps có thể: gửi email cho user và địa chỉ rõ ràng, gửi web hook, khởi chạy một event, và hiển thị thông báo trong app với âm thanh tuỳ chọn cho các user được chọn.
- Channel có thể được bật/tắt, có icon tuỳ chọn, và hỗ trợ giới hạn tần suất mỗi ngày để tránh lũ thông báo.
- Việc thực thi channel được ghi lại trong log Activity của job (đối với job) hoặc lưu trên record alert (đối với alert), bao gồm chi tiết các sub-action.

## Nơi Channel Được Sử Dụng

- Action của Event/Workflow: Thêm một action loại "Notify Channel" để chạy khi job start, hoặc khi có kết quả hoàn thành như error, warning, v.v.
- Action của Alert: Thêm một action loại "Notify Channel" để chạy khi alert kích hoạt hoặc được xoá.
- Admin UI: Tạo và quản lý channel trong Admin → Channels.

Xem [Actions](actions.md) để biết điều kiện và hành vi của action.

## Privilege

Quản lý channel yêu cầu privilege tài khoản:

- `create_channels`: Tạo channel thông báo.
- `edit_channels`: Sửa channel hiện có.
- `delete_channels`: Xóa channel.

Xem [Privileges](privileges.md) để biết chi tiết về gán privilege hoặc role.

## Channel Có Thể Làm Gì

Khi một channel được kích hoạt, PTOps thực thi các action đã cấu hình này song song:

- Email: Gửi email cho tất cả user của channel cùng với bất kỳ địa chỉ bổ sung nào được cung cấp.
- Web Hook: Gửi một web hook gửi ra đã cấu hình với payload dạng template phong phú.
- Run Event: Khởi chạy một event cụ thể như một hành động khắc phục/theo sau.
- In-App Notify: Gửi thông báo UI cho tất cả user của channel; có thể tuỳ chọn phát âm thanh.

Lưu ý:

- Payload email và web hook được dựng template dựa trên context. Đối với job, payload bao gồm link job, trích đoạn log, và metadata. Đối với alert, payload bao gồm chi tiết server và alert với link trực tiếp.
- Các event được khởi chạy kế thừa context: action job bao gồm dữ liệu/file output của job cha; action alert bao gồm metadata alert trong dữ liệu input của job con.
- Các action channel được thực thi song song, và kết quả riêng của chúng được tổng hợp vào chi tiết của action cha để phục vụ auditing.
- Channel bị tắt sẽ bị bỏ qua. Nếu channel được tham chiếu bị tắt, action ghi lại một message và không làm gì.

## Giới Hạn Tần Suất

Channel hỗ trợ giới hạn tuỳ chọn mỗi ngày. Khi đạt đến giới hạn, action channel bị bỏ qua cho đến hết ngày đó và một message được ghi lại. Số lượng reset mỗi ngày vào nửa đêm (giờ server cục bộ).

## Đối Tượng Channel

Channel là các đối tượng hạng nhất với các thuộc tính chính sau. Xem định nghĩa chuẩn trong [Channel](data.md#channel).

- `id`: ID định danh alphanumeric duy nhất. Nếu bỏ trống khi tạo, PTOps sẽ tự tạo một ID.
- `title`: Tiêu đề hiển thị trên UI và thông báo.
- `enabled`: Bật/tắt channel.
- `icon`: Tên icon Material Design tuỳ chọn để hiển thị trên UI.
- `users`: Mảng username để thông báo. Dùng cho cả tra cứu email và thông báo trong app.
- `email`: Danh sách địa chỉ email phân tách bằng dấu phẩy tuỳ chọn (người nhận bên ngoài).
- `web_hook`: [WebHook.id](data.md#webhook-id) tuỳ chọn để gửi.
- `run_event`: [Event.id](data.md#event-id) tuỳ chọn để khởi chạy.
- `sound`: Tên file `.mp3` tuỳ chọn để phát cho user của channel trong thông báo UI.
- `max_per_day`: Giới hạn tuỳ chọn về số lần kích hoạt channel mỗi ngày (0 = không giới hạn).
- `notes`: Ghi chú tự do tuỳ chọn.

## Ví Dụ Channel

JSON ví dụ cho một channel "Severity 1":

```json
{
  "id": "sev1",
  "title": "Severity 1",
  "enabled": true,
  "icon": "bullhorn-outline",
  "users": ["oncall", "noc"],
  "email": "ops@example.com, sre@example.com",
  "web_hook": "slack_ops",
  "run_event": "auto_remediate",
  "sound": "attention-3.mp3",
  "max_per_day": 100,
  "notes": "Used to page on-call for P1 incidents."
}
```

## Sử Dụng Channel Trong Action

Gắn channel qua một action loại "Notify Channel". Ví dụ đoạn action (JSON):

- Action của job (khi error):

```json
{
  "enabled": true,
  "condition": "error",
  "type": "channel",
  "channel_id": "sev1"
}
```

- Action của alert (khi kích hoạt):

```json
{
  "enabled": true,
  "condition": "alert_new",
  "type": "channel",
  "channel_id": "sev1"
}
```

Xem [Actions → Channel](actions.md#channel) để biết ngữ nghĩa action và cách loại bỏ trùng lặp.

## Chi Tiết Hành Vi

- Thực thi song song: Email, web hook, run event, và thông báo UI thực thi đồng thời.
- Loại bỏ trùng lặp: PTOps loại bỏ trùng lặp action theo loại và target ở cấp job/alert. Nhiều tham chiếu đến cùng một channel trong một lần kích hoạt duy nhất chỉ chạy một lần; các action chứa trong đó thực thi một lần như một phần của channel.
- Thông báo trong app: Tất cả `users` nhận thông báo popup với âm thanh tuỳ chọn. Action job liên kết đến job; action alert liên kết đến alert.
- Template: Message email/web hook dùng template job/alert chuẩn. Cấu hình channel không thêm văn bản tuỳ chỉnh; tuỳ chỉnh văn bản riêng cho từng action bằng cách dùng action email/web hook trực tiếp nếu cần.
- Auditing: Đối với job, kết quả sub-action được tổng hợp vào log Activity của job dưới action channel. Đối với alert, kết quả được lưu cùng lịch sử action của alert.

## Quản Lý Channel

- Tạo/Sửa/Xóa trong Admin → Channels.
- Chuyển đổi trạng thái bật/tắt từ danh sách hoặc trình chỉnh sửa channel.
- Chọn icon và âm thanh tuỳ chọn. File âm thanh phải là `.mp3`. UI cung cấp danh sách được chọn lọc; bạn có thể nghe trước âm thanh trong trình chỉnh sửa.
- Đặt `max_per_day` để giới hạn tổng số lần kích hoạt channel mỗi ngày.

## Endpoint API

Đối với automation và công cụ, các endpoint này quản lý channel:

- `app/get_channels/v1`: Liệt kê tất cả channel.
- `app/get_channel/v1`: Lấy một channel duy nhất theo `id`.
- `app/create_channel/v1`: Tạo channel. Nếu bỏ trống `id`, một ID sẽ được tự tạo.
- `app/update_channel/v1`: Cập nhật channel.
- `app/delete_channel/v1`: Xóa channel.

Xem [Channels API](api.md#channels) để biết thêm chi tiết API.

## Ghi Chú và Mẹo

- Giữ channel tập trung: Tạo channel riêng cho các mức độ nghiêm trọng hoặc team khác nhau (ví dụ `ops_oncall`, `security_incidents`, `customer_success`).
- Ưu tiên channel để đảm bảo nhất quán: Tham chiếu cùng một channel qua nhiều event và alert để giữ mẫu thông báo của bạn đồng nhất.
- Cẩn thận với run-event: Đảm bảo event khắc phục là idempotent và an toàn để kích hoạt khi điều kiện lặp lại.
- Giới hạn tần suất là theo từng channel: Nếu bạn cần giới hạn riêng cho các target khác nhau, tách thành nhiều channel.

## Xem Thêm

- API: [Channels](api.md#channels)
- Actions: [Actions](actions.md)
- Cấu trúc dữ liệu: [Channel](data.md#channel)
- Privileges: [Privileges](privileges.md)
- Web Hooks: [Web Hooks](webhooks.md)
- Events: [Events](events.md)
