# Chào mừng đến với PTOps!

PTOps là một trình lập lịch công việc (job scheduler), engine tự động hoá workflow, và nền tảng giám sát server. Nó cho phép bạn chạy các job trên server, điều phối chúng bằng workflow trực quan, thu thập số liệu (metrics), kích hoạt chạy theo lịch hoặc theo chu kỳ, và phản ứng bằng các action và limit. Tất cả đều có sẵn trên giao diện web và qua REST API.

Hướng dẫn này được hiển thị trên dashboard cho người dùng mới để giúp bạn thực hiện những bước đầu tiên, và giới thiệu một số khái niệm cốt lõi. Nó sẽ biến mất ngay khi bạn tạo event đầu tiên. Bạn luôn có thể quay lại xem sau bằng cách nhấn vào "Documentation" ở sidebar, sau đó chọn "Welcome to PTOps".

Nếu bạn muốn một hướng dẫn chi tiết hơn, xem [Bắt đầu với PTOps](start.md). Tài liệu này bao gồm lần cài đặt đầu tiên, hostname của conductor, `base_app_url`, event đầu tiên của bạn, chuỗi event (event chaining), JSON qua STDIO, limit, action web hook, và một workflow cơ bản.


## Bước 1: Thêm Server

Trước khi có thể chạy bất cứ thứ gì, hãy thêm ít nhất một server. Server chạy agent xySat nhẹ và thực thi các job được gửi từ PTOps. Bạn có thể thêm server cho Docker, Linux, macOS, hoặc Windows host.

Thêm server từ giao diện:

1. Mở trang Servers và nhấn "Add Server".
2. Tuỳ chọn đặt label, icon, và group, hoặc để mặc định.
3. Sao chép lệnh cài đặt một dòng cho hệ điều hành của bạn và chạy nó trên host đích.
4. Server sẽ xuất hiện trên giao diện, bắt đầu truyền số liệu (metrics), và sẵn sàng chạy job.

Để tự động hoá việc cấp phát, bạn có thể bootstrap server bằng API key trong quá trình khởi động lần đầu. Xem [Servers](servers.md).


## Khái Niệm Cốt Lõi: Event và Workflow

- **Event**: Một event định nghĩa cái gì sẽ chạy (một plugin cùng các tham số), chạy ở đâu (server hoặc group), khi nào chạy (trigger), và cách kiểm soát/phản ứng (limit và action). Mỗi lần event chạy, nó sẽ khởi tạo một job. Xem [Events](events.md).
- **Workflow**: Một workflow là một đồ thị trực quan liên kết các job bằng luồng điều khiển (control flow). Một lần chạy workflow trở thành một job cha (parent job) khởi tạo các sub-job trên các node của nó. Bạn có thể phân nhánh (fan out), gộp (join), lặp lại (repeat), đa luồng trên nhiều server (multiplex), và gắn limit/action cho từng node. Xem [Workflows](workflows.md).

Bạn có thể giữ hầu hết automation ở dạng event đơn giản. Sử dụng workflow khi cần điều phối, phân nhánh, hoặc chạy song song.


## Trigger: Khi Nào Job Chạy

Trigger kiểm soát khi nào event và workflow được phép chạy. Các trường hợp phổ biến:

- **Manual**: Cho phép người dùng hoặc API khởi chạy theo yêu cầu.
- **Schedule**: Chỉ định giờ/phút/ngày giống cron, có thể tuỳ chọn timezone.
- **Interval**: Chạy mỗi N giây bắt đầu từ một mốc thời gian (timestamp).
- **Single Shot**: Chạy một lần vào một thời điểm chính xác.
- **Plugin**: Logic trigger tuỳ chỉnh được cung cấp bởi plugin.
- **Range và Blackout**: Cho phép hoặc chặn việc khởi chạy trong các khoảng thời gian cụ thể.
- **Options**: Catch-Up (chạy lại các lịch bị bỏ lỡ), Delay (trì hoãn khởi chạy), Precision (lập lịch ở cấp độ giây).

Event hiển thị các trigger trong trình chỉnh sửa. Workflow hiển thị trigger dưới dạng node trong đồ thị và bạn kết nối chúng với các node đầu vào (entry node). Xem [Triggers](triggers.md).


## Plugin: Cái Gì Sẽ Chạy

Event Plugin là đoạn code chạy job của bạn. Các tuỳ chọn có sẵn bao gồm:

- **Shell Plugin**: Chạy script/lệnh shell tuỳ ý.
- **HTTP Request Plugin**: Gọi các endpoint HTTP(S).
- **Docker Plugin**: Chạy script trong container.
- **Test Plugin**: Xuất dữ liệu/file mẫu để test luồng xử lý.

Bạn có thể viết plugin riêng bằng bất kỳ ngôn ngữ nào. Plugin đọc context job dạng JSON qua STDIN và ghi các cập nhật trạng thái dạng JSON ra STDOUT. Xem [Plugins](plugins.md).


## Action và Limit

- **Limit**: Các giới hạn tự áp đặt như Max Run Time, Max Output Size, Max CPU/Memory, Max Concurrent Jobs, Max Queue, và Max Retries. Limit có thể gắn tag, gửi thông báo, chụp snapshot, và tuỳ chọn hủy (abort) job. Limit được kế thừa từ event/workflow, category, và các giá trị mặc định toàn hệ thống. Xem [Limits](limits.md).
- **Action**: Phản ứng với kết quả job (start, success, error, warning, critical, abort, hoặc khớp tag) hoặc với thay đổi trạng thái alert. Các loại action bao gồm email, web hook, run job, ticket, snapshot, và nhiều hơn nữa. Action thực thi song song và loại bỏ trùng lặp (dedupe) theo từng target. Xem [Actions](actions.md).


## Category

Category giúp tổ chức event và kiểm soát giá trị mặc định cùng khả năng hiển thị. Một category có thể:

- Áp dụng action và limit mặc định cho các event trong category.
- Kiểm soát quyền truy cập dựa trên role và privilege của người dùng.
- Cung cấp cách gọn gàng để nhóm các automation liên quan cho team.

Bạn có thể bắt đầu với một category mặc định và tinh chỉnh sau. Xem [Categories](categories.md).


## Thử Ngay: Event Đầu Tiên Của Bạn

1. Vào Events → New Event.
2. Nhập tiêu đề và chọn một category.
3. Chọn Shell Plugin và dán một script đơn giản, ví dụ:

```sh
#!/bin/sh
echo "Hello from PTOps"
echo '{ "xy": 1, "code": 0 }'
```

Dòng JSON cuối cùng báo cho PTOps biết job đã thành công.

4. Chọn một trong các server của bạn (hoặc một group) làm target và giữ nguyên thuật toán chọn mặc định.
5. Thêm một trigger Manual và lưu event.
6. Nhấn Run, xem log truyền trực tiếp (stream), và xem kết quả cùng số liệu (metrics) của job.

Tiếp theo, hãy thử thêm một limit Max Run Time và một action email khi có lỗi. Chạy lại để xem action và limit hoạt động như thế nào.


## Thử Ngay: Workflow Đầu Tiên Của Bạn

1. Vào Workflows → New Workflow.
2. Thêm một node Trigger (Manual) và kết nối nó với một node Event tham chiếu đến event bạn vừa tạo.
3. Tuỳ chọn chèn một Controller (ví dụ Repeat hoặc Multiplex) giữa trigger và event để thấy khả năng chạy song song.
4. Gắn một node Limit (ví dụ Max Concurrent Jobs) vào cực dưới (bottom pole) của node event.
5. Nhấn Test Selection hoặc Run, sau đó kiểm tra job workflow cha và các sub-job của nó.

Xem [Workflows](workflows.md) để biết các loại node, controller, và công cụ chỉnh sửa đồ thị.


## Bước Tiếp Theo

- Theo dõi hướng dẫn từng bước cho người mới bắt đầu. Xem [Bắt đầu với PTOps](start.md).
- Thêm nhiều server hơn và tổ chức chúng bằng group. Xem [Servers](servers.md) và [Groups](groups.md).
- Tạo monitor và alert cho số liệu server. Xem [Monitors](monitors.md) và [Alerts](alerts.md).
- Tái sử dụng thông báo bằng channel. Xem [Channels](channels.md).
- Chia sẻ dữ liệu và file giữa các job bằng bucket. Xem [Buckets](buckets.md).
- Khám phá lập lịch nâng cao, catch-up, range, và blackout window. Xem [Triggers](triggers.md).
- Đóng gói và chia sẻ plugin của riêng bạn. Xem [Plugins](plugins.md) và [Marketplace](marketplace.md).
- Nhấn vào liên kết "Documentation" ở sidebar để xem toàn bộ mục lục tài liệu.

Có câu hỏi hoặc phản hồi? Xem [Hướng dẫn hỗ trợ](support.md) của chúng tôi.

