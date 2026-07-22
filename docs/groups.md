# Server Groups

## Tổng Quan

Server Group (thường gọi tắt là "Group") cho phép bạn tổ chức nhiều server thành các tập hợp hợp lý và thao tác trên chúng như một đơn vị. Một server có thể thuộc bất kỳ số lượng group nào. Group hỗ trợ việc target event (chạy job trên một group thay vì một host cụ thể), tổng hợp các view trực tiếp và lịch sử trên UI, cung cấp action alert mặc định, và cho phép chụp snapshot/watch theo group.

Tài liệu này giải thích group là gì, server tham gia group như thế nào (tự động và thủ công), event target group và chọn server ra sao, action alert mặc định hoạt động thế nào, cách chụp snapshot/watch cho group, và bạn có thể làm gì trên trang UI của group.

## Điểm Chính

- Group là tập hợp server có tên; một server có thể ở trong nhiều group.
- Server có thể tham gia group tự động qua khớp regular expression với hostname, hoặc bạn có thể gán group thủ công cho từng server.
- Event có thể target group để chạy job; PTOps chọn một server phù hợp trong group cho mỗi job bằng thuật toán có thể cấu hình.
- Mỗi group có một trang UI riêng hiển thị server của group, trạng thái trực tiếp, monitor, process, connection, job, job sắp tới, và thống kê.
- Group có thể định nghĩa action alert mặc định chạy khi bất kỳ alert nào fire hoặc clear trên bất kỳ server nào trong group.
- Bạn có thể chụp snapshot của group theo yêu cầu, hoặc đặt "watch" để chụp snapshot mỗi phút trong một khoảng thời gian.

## Tạo Và Sửa Group

- **Vị trí**: Sidebar → Monitoring → Groups.
- **Tạo**: Nhấn "New Group...", đặt tiêu đề, icon tuỳ chọn, và regex hostname tuỳ chọn để tự gán. Bạn cũng có thể thêm action alert mặc định và notes.
- **Sửa**: Nhấn vào một group → Edit Group để thay đổi các trường; ID không thể thay đổi.
- **Sắp xếp lại**: Kéo các dòng trong danh sách để thay đổi thứ tự.
- **Import/Export**: Sử dụng nút Import/Export trên danh sách và trình chỉnh sửa.
- **Quyền**: Tạo, sửa, xoá group cần các privilege [create_groups](privileges.md#create_groups), [edit_groups](privileges.md#edit_groups), và [delete_groups](privileges.md#delete_groups) tương ứng.

Các trường của group:

- **Title**: Tên hiển thị của group.
- **Icon**: ID Material Design Icon tuỳ chọn.
- **Hostname Match**: Regular expression để tự gán server theo hostname. Để trống để không khớp gì; dùng `.+` để khớp tất cả server.
- **Alert Actions**: Action alert mặc định cho các alert trong group này (chi tiết bên dưới).
- **Notes**: Văn bản tự do tuỳ chọn.

## Thêm Server Vào Group

Server có thể được thêm vào group theo hai cách, và một server có thể thuộc nhiều group cùng lúc.

1. **Tự Động Theo Hostname**
	- Mỗi group có thể chỉ định một regular expression hostname trong `hostname_match`.
	- Khi một server kết nối (hoặc hostname của nó thay đổi), PTOps kiểm tra nó với tất cả group và gán bất kỳ group nào khớp.
	- Việc tự gán này được đánh giá lại mỗi khi group thay đổi (tạo/sửa/xoá) và truyền tới server và storage.
	- Để khớp tất cả server, dùng `.+`.
2. **Gán Thủ Công Cho Mỗi Server**
	- Từ bất kỳ trang Server nào, chọn "Edit Server..." và đặt Groups rõ ràng, hoặc dùng "Add Server..." trên view của Group.
	- Khi bạn gán group thủ công cho một server, hành vi "Auto Group" của server đó sẽ bị tắt.
	- Để đưa một server trở về việc tự gán, xoá danh sách group thủ công của nó và bật lại Auto Group trong trình chỉnh sửa server.

Ghi chú:

- Việc thuộc group là cộng dồn: một server có thể ở trong nhiều group qua cả gán tự động và thủ công (trừ khi Auto Group bị tắt bởi override thủ công).
- Việc target event tuân theo group hiện tại của server đang trực tiếp (live); thay đổi có hiệu lực ngay cho các job mới.

## Action Alert Mặc Định

Group có thể định nghĩa action alert mặc định, chạy khi bất kỳ alert nào fire hoặc clear trên bất kỳ server nào trong group.

- Trong trình chỉnh sửa Group, dưới "Alert Actions".
- Khi chúng chạy: Khi `alert_new` (alert đã fire) và/hoặc `alert_cleared` (alert đã clear), dựa trên `condition` của từng action.
- Cách chúng kết hợp: Với một sự kiện alert cho trước, danh sách action cuối cùng là sự hợp nhất của:
	- Action của chính định nghĩa alert.
	- Action mặc định của group của tất cả server khớp (cho mỗi group mà server thuộc vào).
	- Action alert toàn hệ thống (universal) từ cấu hình.
	- Action được loại bỏ trùng lặp theo type + target (ví dụ: cùng người nhận email, cùng ID web hook).
- Context target: Action của group bao gồm context group và server trong thông báo (email/web hook có tiêu đề và link của group).

Xem [Actions](actions.md) để biết các loại và tham số được hỗ trợ.

## Target Event Vào Group

Thay vì chọn server cụ thể, bạn có thể target một hoặc nhiều Group cho một Event. Lúc khởi chạy job, PTOps giải quyết group thành tập hợp các server đang online, đã bật, và chọn một server cho job bằng thuật toán chọn của event.

Hành vi:

- **Giải quyết**: `targets` của Event có thể bao gồm cả server ID và/hoặc group ID. Group được mở rộng thành các server thành viên của nó (tính đến thời điểm khởi chạy).
- **Đủ điều kiện**: Chỉ server đang online và được bật mới được xem xét. Server có thể bị loại trừ nếu một số alert đang active chỉ định "limit jobs" (cài đặt cấp alert).
- **Không có server nào khả dụng**: Nếu không server nào đủ điều kiện, PTOps có thể queue job nếu event có định nghĩa Queue limit; ngược lại nó sẽ fail ngay lập tức. Xem [Limits](limits.md#max-queue-limit).

Thuật toán chọn:

- `random`: Chọn một server ngẫu nhiên từ tập hợp đủ điều kiện.
- `round_robin`: Xoay vòng qua tập hợp đủ điều kiện theo mỗi event; được duy trì qua các lần chạy.
- `prefer_first_natural`: Ưu tiên server đầu tiên theo thứ tự tự nhiên trong danh sách [Event.targets](data.md#event-targets).
- `prefer_last_natural`: Ưu tiên server cuối cùng theo thứ tự tự nhiên trong danh sách [Event.targets](data.md#event-targets).
- `prefer_first`: Chọn server đầu tiên sau khi sắp xếp theo label hoặc hostname tăng dần.
- `prefer_last`: Chọn server cuối cùng sau khi sắp xếp theo label hoặc hostname tăng dần.
- `least_cpu`: Chọn server có tải CPU trung bình hiện tại thấp nhất (`info.cpu.avgLoad`).
- `least_mem`: Chọn server có mức sử dụng bộ nhớ active hiện tại thấp nhất (`info.memory.active`).
- `monitor:<id>`: Chọn server có giá trị thấp nhất của monitor được chỉ định.

Chi tiết:

- Tập hợp đủ điều kiện được loại bỏ trùng lặp và xây dựng từ tất cả target (group và server), sau đó được lọc theo trạng thái online/enabled và loại trừ theo alert.
- Với `round_robin`, PTOps duy trì trạng thái xoay vòng theo mỗi event để việc phân bổ công bằng qua các lần restart hoặc chuyển đổi conductor.

Xem [Events → Server Selection](events.md#server-selection) và [Data → Event.algo](data.md#event-algo) để biết thêm ngữ cảnh.

## Snapshot Và Watch Cho Group

Snapshot chụp lại trạng thái của group tại một thời điểm (bao gồm server thành viên, metric gần đây, job, và alert). Watch tự động chụp snapshot mỗi phút trong một khoảng thời gian.

- **Chụp snapshot**: Trên view của Group, nhấn "Snapshot". Cần privilege [create_snapshots](privileges.md#create_snapshots).
- **Group watch**: Nhấn nút Watch, đặt thời gian, và PTOps sẽ chụp snapshot của group mỗi phút cho đến khi hết thời gian. Đặt thời gian bằng 0 để hủy.
- **Lịch sử**: Snapshot của group xuất hiện trên trang Snapshots và liên kết ngược về group.
- **Nội dung**: Một snapshot của Group bao gồm định nghĩa group, các server khớp, phút metric "quick" cuối cùng của mỗi server, job đang active trên các server đó, và alert liên quan đến group.

Xem thêm: [Snapshots](snapshots.md) và [Data → GroupSnapshot](data.md#groupsnapshot).

## UI Của Group

Mỗi group có một view trực tiếp riêng tổng hợp toàn bộ server thành viên. Từ Monitoring → Groups, nhấn vào một group để mở trang của nó.

Bạn sẽ thấy:

- Tóm tắt: ID/tiêu đề/icon của group, regex hostname match, số lượng server, số lượng action alert, tác giả, thời gian tạo/sửa, và phân tích fleet (kiến trúc, OS, loại CPU, virtualization).
- Điều khiển: Edit Group, Snapshot, Watch, Add Server, cùng các shortcut đến Group History, Alert History, và Job History.
- Bảng server: Tất cả server trong group (online và mới offline gần đây), với trạng thái trực tiếp, biểu đồ donut tài nguyên, job đang chạy, và điều khiển. Hỗ trợ lọc và chọn.
- Quick Look: Biểu đồ trực tiếp theo giây cho CPU, memory, disk, và network trên các server hiển thị trong phút cuối cùng.
- Chi tiết Memory và CPU: Phân tích memory/CPU tổng hợp theo từng server với tuỳ chọn gộp cho view gọn.
- Monitors: Giờ cuối cùng của các monitor đã cấu hình, có tuỳ chọn lọc và điều chỉnh kích thước biểu đồ; một layer cho mỗi server.
- Process và Connection: Bảng process hiện tại tổng hợp và các connection network đang active trên toàn group với các bộ lọc.
- Jobs: Job đang active chạy trên bất kỳ server nào trong group; bao gồm progress bar và thời gian còn lại.
- Upcoming jobs: Job dự kiến trong tương lai sẽ chạy trên bất kỳ server nào trong group (dựa trên lịch của event target group).
- Alerts: Alert đang active ảnh hưởng đến bất kỳ server thành viên nào, có link đến chi tiết.

## API

Các endpoint sau hỗ trợ group trên UI và automation:

- Liệt kê group: `app/get_groups`
- Lấy group: `app/get_group`
- Tạo group: `app/create_group`
- Cập nhật group: `app/update_group`
- Xoá group: `app/delete_group`
- Sắp xếp lại group: `app/multi_update_group`
- Tạo snapshot của group: `app/create_group_snapshot`
- Đặt/hủy watch: `app/watch_group`

Xem [API](api.md) để biết chi tiết request/response.

## Thực Hành Tốt Nhất

- Ưu tiên nhóm tự động với các pattern hostname rõ ràng, ổn định (ví dụ: tiền tố môi trường hoặc vai trò). Dùng gán thủ công cho các trường hợp đơn lẻ.
- Sử dụng nhiều group để diễn đạt các khái niệm độc lập (ví dụ: "prod", "db", "east"), sau đó target event với nhiều group khi cần.
- Kết hợp action alert mặc định của group với action riêng của alert để tập trung việc điều hướng on-call.
- Với fleet đa dạng, xem xét chọn `monitor:<id>` để định tuyến job dựa trên tải hoặc năng lực hiện tại.
