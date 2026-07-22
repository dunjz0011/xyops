# Categories

## Tổng Quan

Category nhóm các event và workflow liên quan lại với nhau, và hoàn toàn do người dùng định nghĩa. Mỗi event/workflow thuộc về đúng một category. Category giúp việc điều hướng và tìm kiếm dễ dàng hơn, kiểm soát khả năng hiển thị (qua role), tạo sự phân biệt trực quan, và có thể định nghĩa action/limit mặc định cho tất cả những gì bên trong.

## Điểm Chính

- Tạo bao nhiêu category tuỳ chỉnh tuỳ ý.
- Mỗi event/workflow được gán một category (workflow hoạt động giống event trong trường hợp này).
- Giá trị mặc định: [Actions](actions.md) và [Limits](limits.md) của category tự động áp dụng cho tất cả job bên trong.
	- Thứ tự ưu tiên cho limit tại thời điểm khởi chạy là Event → Category → Universal; các limit runtime có thể chồng lên nhau.
	- Action được loại bỏ trùng lặp theo type/target.
- Hình ảnh: màu và icon tuỳ chọn. Màu hiển thị như một lớp nền (tint) trong danh sách event và danh sách job đang chạy. Icon lấy từ Material Design Icons.
- Bật/Tắt: tắt một category sẽ ngăn việc lập lịch và khởi chạy cho tất cả event/workflow bên trong nó.
- Thứ tự: Category có "thứ tự sắp xếp" (sort order) được áp dụng vào danh sách event/workflow.

Ví dụ category tối giản (định dạng JSON):

```json
{
  "id": "prod",
  "title": "Production",
  "enabled": true,
  "color": "red",
  "actions": [
    { "enabled": true, "condition": "error", "type": "email", "users": ["oncall"] }
  ],
  "limits": [
    { "enabled": true, "type": "time", "duration": 3600, "abort": true }
  ]
}
```

Xem đầy đủ cấu trúc dữ liệu: [Category](data.md#category)

## Giá Trị Mặc Định: Action và Limit

Category có thể mang các action job và limit tài nguyên mặc định, áp dụng cho tất cả event và workflow trong category khi job khởi chạy.

- **Action**
  - Kết hợp với action ở cấp event và action toàn hệ thống (universal); các action trùng lặp được loại bỏ theo type/target. Xem [Actions](actions.md).
  - Trường hợp sử dụng phổ biến: gửi email khi `error`, kích hoạt `web_hook` khi `critical`, hoặc chạy một event dọn dẹp khi `warning`.
- **Limit**
  - Đóng vai trò giá trị mặc định; event/workflow có thể thêm hoặc override theo type. Xem [Limits](limits.md).
  - Thứ tự ưu tiên tại thời điểm khởi chạy: Event/Workflow → Category → Universal.
  - Các limit runtime (time/log/mem/cpu) có thể chồng lên nhau và kích hoạt độc lập.

## Hình Ảnh: Màu và Icon

- **Màu**: lớp nền hiển thị trong danh sách event và danh sách job đang chạy. Các màu có sẵn: `plain`, `red`, `green`, `blue`, `skyblue`, `yellow`, `purple`, `orange`.
- **Icon**: Material Design Icon tuỳ chọn (ví dụ: `folder-outline`, `shield-alert-outline`). Icon chỉ có tác dụng hiển thị.

## Hành Vi Bật/Tắt

- Category được bật: job được lập lịch và khởi chạy bình thường.
- Category bị tắt: scheduler sẽ không kích hoạt các event bên trong, và việc chạy thủ công cũng bị chặn dù event đang bật.

## Quản Lý

- UI: Admin → Categories. Tạo/sửa title, enabled, icon, color, notes, action và limit mặc định. Kéo thả để sắp xếp lại. Chỉ xoá được khi không có event nào tham chiếu đến nó. Hỗ trợ Import/Export JSON.
- API: list, fetch, create, update, reorder, delete -- xem [API: Categories](api.md#categories).
- Privilege: [create_categories](privileges.md#create_categories), [edit_categories](privileges.md#edit_categories), [delete_categories](privileges.md#delete_categories).

## Tham Chiếu Nhanh API

- `GET /api/app/get_categories/v1`: liệt kê tất cả category.
- `GET /api/app/get_category/v1`: lấy một category theo `id`.
- `POST /api/app/create_category/v1`: tạo mới (kiểm tra hợp lệ `limits`/`actions` lồng bên trong).
- `POST /api/app/update_category/v1`: cập nhật theo kiểu shallow-merge; cập nhật `modified` và `revision`.
- `POST /api/app/delete_category/v1`: xoá; bị chặn nếu có event nào tham chiếu đến nó.

## Ví Dụ

Hai category với giá trị mặc định khác nhau, và một event override số lượng chạy song song (concurrency) trong khi kế thừa phần còn lại:

```json
// Category: Production
{
  "id": "prod",
  "title": "Production",
  "enabled": true,
  "color": "red",
  "icon": "shield-alert-outline",
  "actions": [
    { "enabled": true, "condition": "error", "type": "email", "users": ["oncall"] },
    { "enabled": true, "condition": "critical", "type": "web_hook", "web_hook": "slack_ops" }
  ],
  "limits": [
    { "enabled": true, "type": "retry", "amount": 2, "duration": 60 },
    { "enabled": true, "type": "time",  "duration": 3600, "abort": true }
  ]
}

// Category: Staging
{
  "id": "staging",
  "title": "Staging",
  "enabled": true,
  "color": "skyblue",
  "actions": [
    { "enabled": true, "condition": "error", "type": "email", "users": ["dev"] }
  ],
  "limits": [
    { "enabled": true, "type": "job", "amount": 3 }
  ]
}

// Event (in prod) overriding concurrency
{
  "id": "deploy_app",
  "title": "Deploy Application",
  "enabled": true,
  "category": "prod",
  "plugin": "shellplug",
  "limits": [ { "enabled": true, "type": "job", "amount": 1 } ],
  "actions": []
}
```

Khi khởi chạy, `deploy_app` nhận limit `job` của event, cộng thêm limit `retry` và `time` của prod, cùng các action của prod. Giá trị mặc định toàn hệ thống (universal, nếu có cấu hình) sẽ được thêm vào sau các giá trị mặc định của category.
