# Tags

## Tổng Quan

Tag là nhãn do người dùng định nghĩa mà bạn có thể gắn vào event, job, và ticket. Chúng đóng vai trò metadata nhẹ để tổ chức và tìm kiếm, và cũng có thể điều khiển automation bằng cách kích hoạt các job action có điều kiện. Tag được định nghĩa một lần (với title, icon tuỳ chọn, và ghi chú tuỳ chọn) rồi được tham chiếu bằng ID ở mọi nơi tag được hỗ trợ.

- **Hiển thị**: Tag hiển thị cùng với event, job đang chạy, và ticket để truyền đạt nhanh trạng thái như môi trường hoặc mức độ ưu tiên.
- **Tìm kiếm**: Tìm kiếm job và ticket có thể được lọc theo tag.
- **Automation**: Job có thể thêm tag động lúc runtime, và tag có thể kích hoạt action bằng điều kiện dựa trên tag.

## Định Nghĩa Tag

Một định nghĩa tag bao gồm:

- `id`: ID chữ và số được PTOps tự động sinh (hoặc cung cấp qua API).
- `title`: Tiêu đề hiển thị trong UI.
- `icon`: [Material Design Icons](https://pictogrammers.com/library/mdi/) ID tuỳ chọn.
- `notes`: Ghi chú tự do tuỳ chọn.

Tạo, chỉnh sửa, và xoá định nghĩa tag trong UI, hoặc dùng [Tag APIs](api.md#tags). Sau khi được định nghĩa, tag xuất hiện trong menu chọn (ví dụ bộ chọn điều kiện action) và có sẵn để tìm kiếm.

**Quan trọng**: Tag ID là key tham chiếu được dùng ở mọi nơi (bao gồm trong điều kiện job action và cập nhật runtime plugin). Khi không chắc chắn, hãy sao chép ID của tag từ UI. Tránh tạo tag ID bắt đầu bằng dấu gạch dưới; những ID này được dành riêng cho system tag do PTOps thêm vào.

## Tag Áp Dụng Ở Đâu

Tag xuất hiện ở ba nơi và chảy vào job khi chúng chạy:

- **Event**: Mỗi event có thể định nghĩa một bộ tag mặc định. Chúng được áp dụng cho lần khởi chạy job, nhưng có thể tuỳ chỉnh khi chạy job thủ công.
- **Job**: Job đang chạy có thể tích luỹ thêm tag. Nguồn bao gồm plugin (cập nhật push), node workflow, và resource limit.
- **Ticket**: Ticket có thể có tag riêng của mình và, đối với mỗi event đính kèm, một ticket có thể override hoặc cung cấp thêm tag để áp dụng cho job khởi chạy từ ticket.

## Gắn Tag Động Từ Plugin

Event Plugin có thể thêm tag vào job đang chạy bằng cách gửi một cập nhật push qua STDOUT. Đây chỉ là thêm vào (additive), không thay thế/xoá, và tag được loại bỏ trùng lặp. Tag ID phải tham chiếu đến định nghĩa tag đã tồn tại. Ví dụ message push từ một process Plugin:

```json
{ "xy": 1, "push": { "tags": ["tmi9dxf3792", "tb359d6dde"] } }
```

Ghi chú:

- Chỉ push được hỗ trợ cho tag trong lúc runtime; cập nhật trực tiếp vào `job.tags` bị bỏ qua.
- Tag ID phải đã tồn tại; định nghĩa chúng trước trong UI hoặc qua API.
- Tag trùng lặp được tự động loại bỏ.

Để biết chi tiết về I/O của plugin, xem [Plugins → Tags](plugins.md#tags).

## Action Điều Khiển Bởi Tag

Action có thể được đặt điều kiện dựa trên sự có mặt của một tag khi job hoàn tất. Khi job hoàn tất và chứa tag đó, action sẽ chạy. Điều này cho phép định tuyến có mục tiêu như "nếu production thì page on-call; nếu dev thì chỉ log lại."

- **Thời điểm**: Chỉ kích hoạt khi job hoàn tất.
- **Hành vi retry**: Action hoàn tất (bao gồm dựa trên tag) chỉ chạy khi job không bị retry.
- **Loại bỏ trùng lặp**: Action với type/target giống nhau được loại bỏ trùng lặp để chỉ chạy một lần dù được góp từ nhiều nguồn.

Ví dụ action chỉ gửi email khi job hoàn tất và có mặt tag production:

```json
{
  "enabled": true,
  "condition": "tag:tmi9dxf3792",
  "type": "email",
  "users": ["oncall"],
  "email": "ops@example.com"
}
```

Bạn có thể chọn điều kiện dựa trên tag từ danh sách tag đầy đủ trong UI.

## Các Cách Khác Tag Được Áp Dụng

Ngoài tag mặc định của event và push từ plugin, tag cũng có thể được thêm bởi các tính năng khác:

- **Resource Limits**: Limit trên một job (ví dụ time, log size, memory, CPU) có thể áp dụng tag khi vượt quá. Điều này xảy ra lúc runtime và hiển thị trong activity của job. Xem actions.md và data.md (Limit object) để biết cấu hình.
- **Workflows**: Một node workflow có thể định nghĩa tag cho sub-job của nó. Sau khi sub-job hoàn tất, tag do người dùng định nghĩa (không có dấu gạch dưới) sẽ nổi lên (bubble up) job workflow cha để dễ hiển thị và tìm kiếm (lib/workflow.js).
- **Tickets**: Khi một ticket được tạo qua job action, nó sẽ tự động kế thừa tất cả tag từ job.

## Tìm Kiếm và Lọc

Tag là bộ lọc tìm kiếm hạng nhất (first-class) trong toàn PTOps. Các trường hợp sử dụng phổ biến bao gồm:

- **Jobs**: Lọc job lịch sử theo tag (ví dụ Production + Sev1).
- **Tickets**: Lọc theo nhãn triage (ví dụ Sev2, Maintenance).
- **Events**: Dùng tag để nhóm và định vị automation liên quan.

Khi xây dựng truy vấn API hoặc dùng UI, dùng tag ID. Title chỉ dùng để hiển thị.

## Quản Lý Tag Qua API

Các endpoint quản lý tag có sẵn cho automation và pipeline CI/CD:

- [get_tags](api.md#get_tags): Liệt kê tất cả tag.
- [get_tag](api.md#get_tag): Lấy một tag theo ID.
- [create_tag](api.md#create_tag): Tạo tag mới (title bắt buộc; id tuỳ chọn; icon/notes tuỳ chọn). Yêu cầu privilege [create_tags](privileges.md#create_tags).
- [update_tag](api.md#update_tag): Cập nhật tag theo ID (ví dụ title/icon/notes). Yêu cầu privilege [edit_tags](privileges.md#edit_tags).
- [delete_tag](api.md#delete_tag): Xoá tag theo ID. Yêu cầu privilege [delete_tags](privileges.md#delete_tags).

Response tuân theo định dạng chuẩn và bao gồm object [Tag](data.md#tag) đầy đủ khi có thể.

## Mẹo và Tag Được Đề Xuất

Đây là một số tag thực tế, đa mục đích bạn có thể tạo:

- **Môi trường**: `Production`, `Staging`, `Dev`, `QA`
- **Ưu tiên/Mức độ nghiêm trọng**: `Sev1`, `Sev2`, `Sev3`; `Priority:High`, `Priority:Low`
- **Khung thời gian thay đổi**: `Freeze`, `Maintenance`
- **Chủ sở hữu/Team**: `Team:Ops`, `Team:Payments`
- **Độ nhạy cảm dữ liệu**: `PII`, `Finance`
- **Nhãn phát hành**: `Release:2025/11`, `Canary`, `Beta`

Hướng dẫn:

- Giữ title tag thân thiện với người dùng; ưu tiên nhãn gọn gàng truyền đạt ý nghĩa nhanh chóng.
- Dùng UI để tạo tag để ID được sinh ra và nhất quán; nếu tạo ID qua API, chỉ dùng chữ, số và gạch dưới.
- Tránh ID bắt đầu bằng dấu gạch dưới (_) để tránh xung đột với system tag.
- Định nghĩa tag trước khi tham chiếu chúng trong event, ticket, action, hoặc push từ plugin.
