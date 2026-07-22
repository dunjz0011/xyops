# Users and Roles

## Tổng Quan

Tài liệu này giải thích cách tài khoản người dùng, role, và quyền hạn hoạt động trong PTOps. Nền tảng bao gồm quản lý tài khoản (tạo, đăng nhập, session, đặt lại password) và mở rộng thêm role, giới hạn resource, log an ninh người dùng, avatar, và công cụ admin.

- Hệ thống tài khoản cốt lõi: xác thực tích hợp, quản lý session, và luồng đặt lại password.
- Mở rộng: role và privilege hiệu lực, giới hạn category/group, log an ninh người dùng, "Logout All Sessions", avatar, và tuỳ chọn UI phong phú.
- Admin quản lý người dùng và role trong Admin UI; mọi thay đổi được thực thi bởi backend.

Xem thêm:

- Định nghĩa đối tượng [User](data.md#user) và [Role](data.md#role).
- [Danh Sách Privilege](privileges.md)
- [Tích Hợp SSO](sso.md)

## Hồ Sơ Người Dùng

Mỗi người dùng đại diện cho một tài khoản con người. Hồ sơ kết hợp danh tính, xác thực, quyền hạn, và tuỳ chọn UI. Để xem schema JSON đầy đủ, xem [User](data.md#user).

- **Danh tính**: `username` (duy nhất), `full_name` (tên hiển thị), `email` (liên hệ).
- **Trạng thái**: `active` (true/false cho active/bị đình chỉ). Người dùng bị đình chỉ không thể đăng nhập.
- **Xác thực**: `password` (hash bcrypt), `salt` (theo từng người dùng). Password dạng plaintext không bao giờ được lưu.
- **Roles**: mảng `roles` chứa các role ID; xem Roles bên dưới.
- **Privileges**: object `privileges` (các key cấp khả năng). Xem [Privileges](privileges.md).
- **Giới hạn resource**: mảng `categories` và `groups` tuỳ chọn giới hạn quyền truy cập đến category event và group server.
- **Tuỳ chọn**: các tuỳ chọn UI/locale bao gồm `language`, `region`, `num_format`, `hour_cycle`, `timezone`, `color_acc`, `privacy_mode`, `effects`, `contrast`, `motion`, `volume`, và `searches` đã lưu.
- **Avatar**: Hình ảnh hồ sơ tuỳ chọn. Upload/thay thế trên UI.

Ghi chú:

- Privilege đặc biệt `admin` cấp toàn quyền truy cập đến tất cả các khả năng hiện tại và tương lai, và bỏ qua giới hạn category/group.
- PTOps có thể đặt các cờ nội bộ cho tài khoản được quản lý bởi SSO (ví dụ: `remote`, `sync`); xem [SSO](sso.md) để biết chi tiết.

## Roles

Một role đóng gói một tập hợp privilege và giới hạn resource tuỳ chọn. Gán role cho người dùng để đơn giản hoá việc quản lý quyền hạn. Để xem schema JSON đầy đủ, xem [Role](data.md#role).

- **Privileges**: object `privileges` của một role đóng góp privilege cho người dùng được gán.
- **Giới hạn category**: `categories` có thể giới hạn quyền truy cập đến các category event cụ thể.
- **Giới hạn group**: `groups` có thể giới hạn quyền truy cập đến các group server cụ thể.
- **Cờ enabled**: Chỉ các role đã bật mới đóng góp vào quyền hiệu lực của người dùng.

Admin có thể tạo, sửa, bật/tắt, và xoá role trong Admin UI. Khi role thay đổi, socket của người dùng được cập nhật để các session đang active phản ánh quyền mới ngay lập tức.

## Quyền Hiệu Lực

PTOps tính toán quyền xác thực hiệu lực của một người dùng bằng cách kết hợp các gán trực tiếp với các quyền cấp từ role. Privilege được cộng dồn khi hợp nhất với role được gán.

- Hợp nhất privilege: Privilege của tài khoản và role được hợp nhất.
- Giới hạn category và group: Nếu không được gán, người dùng có quyền truy cập đến "tất cả" category hoặc group.
- Ghi đè admin: Nếu `admin` là true, trực tiếp hoặc kế thừa từ role, người dùng có thể thực hiện bất kỳ hành động nào và không bị giới hạn bởi giới hạn category/group.

Cách thực thi hoạt động:

- Kiểm tra API: Backend thực thi privilege trên mọi lệnh gọi, và kiểm tra resource cho category/group/target.
- Lọc UI: Danh sách và điều khiển trên UI tuân theo quyền hiệu lực và giới hạn resource; các mục không thể truy cập bị ẩn hoặc chặn.

Để xem danh sách đầy đủ các ID privilege mà hệ thống nhận diện, xem [Privileges](privileges.md). Privilege `admin` là đặc biệt và bao hàm tất cả các privilege khác.

## Giới Hạn Resource

Người dùng có thể bị giới hạn đến các category event và/hoặc group server cụ thể:

- Category: Nếu một người dùng/role định nghĩa bất kỳ `categories` nào, người dùng chỉ có thể xem và thao tác trên event trong các category đó. Nếu không định nghĩa cái nào, tất cả category được cho phép (trừ khi bị cấm bởi privilege khác).
- Group: Nếu một người dùng/role định nghĩa bất kỳ `groups` nào, target của job phải giao với các group đó. Nếu không định nghĩa cái nào, tất cả group được cho phép (tuỳ thuộc vào privilege). Kiểm tra target bao gồm group; kiểm tra server riêng lẻ không được thiết kế chi tiết.
- Ghi đè admin: Administrator không bị giới hạn bởi giới hạn category/group.

Các trường hợp điển hình:

- Phân bổ theo phòng ban: Gán người dùng vào role chỉ cho phép category "Dev" hoặc "Ops".
- Tách biệt môi trường: Giới hạn người dùng cụ thể vào group "Staging" nhưng không có "Production".

## Session Và Xác Thực

PTOps xử lý việc tạo tài khoản, đăng nhập, quản lý session, và đặt lại password, và cũng thêm việc ghi log hoạt động và các tính năng liên quan.

- Hết hạn: Session hết hạn theo cài đặt cấu hình [User.session_expire_days](config.md#user-session_expire_days).
- Khoá tài khoản: Nhiều lần đăng nhập thất bại trong một giờ sẽ kích hoạt việc khoá tài khoản yêu cầu đặt lại password (có thể cấu hình). Admin có thể "Reset Lockouts" cho một người dùng.
- Quản lý password: Người dùng có thể đổi password (phải cung cấp password hiện tại). Luồng quên/đặt lại được hỗ trợ qua email template.
- Single Sign-On: PTOps hỗ trợ SSO qua trusted-header thông qua một proxy (ví dụ: OAuth2-Proxy), có thể tự động gán role/privilege dựa trên group của IdP, và có thể redirect khi logout. Xem [SSO](sso.md).

## Log An Ninh

PTOps ghi lại hoạt động liên quan đến tài khoản trong một log an ninh riêng cho từng người dùng và một log hoạt động toàn hệ thống.

- Log an ninh người dùng: Bao gồm các hành động như đăng nhập, cập nhật hồ sơ, đổi password, thông báo/cảnh báo, và metadata IP/user-agent. Có thể xem trên UI dưới "Security Log".
- Log hoạt động hệ thống: Một log audit rộng hơn cho tất cả hành động hệ thống (hướng đến admin).
- User agent đã phân tích: UI hiển thị chuỗi user agent thân thiện khi có sẵn.

Logout All Sessions:

- Người dùng có thể vô hiệu hoá tất cả các session khác của họ sau khi nhập password hiện tại. Session hiện tại vẫn active.
- Admin có thể buộc "Logout All Sessions" cho bất kỳ người dùng nào. Điều này cũng gửi một email tóm tắt nếu các session đã bị chấm dứt.

## Nhiệm Vụ Admin

Administrator có thể thực hiện các hành động sau từ Admin UI hoặc API tương đương:

- **Tạo người dùng**: Đặt username, tên hiển thị, email, password khởi tạo, privilege/role; tuỳ chọn gửi email chào mừng.
- **Sửa người dùng**: Cập nhật hồ sơ, đổi password, điều chỉnh privilege/role, gán giới hạn category/group, chuyển đổi active/bị đình chỉ.
- **Mở khoá tài khoản**: Reset lockout và xoá throttle nếu một tài khoản bị khoá do đăng nhập thất bại.
- **Xoá người dùng**: Xoá tài khoản và xoá log an ninh của người dùng; socket đang active bị đóng.
- **Buộc logout**: Đưa vào hàng đợi một job nền để chấm dứt tất cả các session khác của một người dùng.
- **Quản lý role**: Tạo/cập nhật role với privilege và giới hạn category/group; bật/tắt role.
