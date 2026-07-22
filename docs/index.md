# Mục Lục Tài Liệu

## Tổng Quan

Chào mừng đến với tài liệu PTOps. PTOps là một trình lập lịch công việc, engine workflow, và nền tảng giám sát server với giao diện web tích hợp và REST API. Mục lục này tổ chức tài liệu thành các phần hợp lý kèm tóm tắt ngắn để giúp bạn tìm thấy thứ mình cần nhanh chóng. Nếu bạn mới sử dụng PTOps, hãy bắt đầu với Getting Started. Nếu bạn đang lên kế hoạch triển khai production, hãy bắt đầu với Self-Hosting.

## Bắt Đầu Từ Đây

- **[Chào mừng đến với PTOps](welcome.md)**: Giới thiệu PTOps và cung cấp một số mẹo cho người mới bắt đầu. Hiển thị khi đăng nhập lần đầu.
- **[Bắt Đầu](start.md)**: Một hướng dẫn thân thiện từ lần cài đặt đầu tiên đến event và workflow đầu tiên của bạn.
- **[Tự Triển Khai (Self-Hosting)](hosting.md)**: Cài đặt PTOps với Docker, thêm worker, cấu hình TLS, storage, và các cài đặt production.
- **[Cấu Hình](config.md)**: Toàn bộ các tuỳ chọn cấu hình server, các lớp override, và vị trí lưu trữ cài đặt trên đĩa.
- **[Giao Diện Người Dùng](ui.md)**: Cài đặt UI client, khả năng hiển thị sidebar, whitelabel, mặc định sắp xếp bảng, và giới hạn upload.
- **[Cài Đặt Storage](storage.md)**: Cách thiết lập và cấu hình backend lưu trữ file và database engine.
- **[Mở Rộng Quy Mô Production](scaling.md)**: Các phương pháp tốt nhất khi chạy ở quy mô lớn, định cỡ phần cứng, caching, và multi-conductor.
- **[Command Line](cli.md)**: Các lệnh điều khiển dịch vụ và tiện ích quản trị có sẵn qua `bin/control.sh`.
- **[Cronicle](cronicle.md)**: Di chuyển từ Cronicle, bật chế độ tương thích, và whitelabel UI tuỳ chọn.
- **[Recipes](recipes.md)**: Các mẫu thực tế như job liên tục (continuous job) và xử lý lỗi mà bạn có thể sao chép và áp dụng.

## Khái Niệm Cốt Lõi

- **[Events](events.md)**: Định nghĩa cái gì sẽ chạy, ở đâu, khi nào, và cách nào; nền tảng khởi tạo job.
- **[Workflows](workflows.md)**: Đồ thị trực quan điều phối nhiều job với luồng điều khiển, fan-out/in, và limit.
- **[Triggers](triggers.md)**: Schedule, interval, single-shot, manual, range, blackout window, và các tuỳ chọn precision.
- **[Limits](limits.md)**: Các giới hạn tự áp đặt trong runtime (thời gian, output, CPU, memory) và kiểm soát retry/queue.
- **[Actions](actions.md)**: Phản ứng với kết quả job và thay đổi trạng thái alert (email, web hook, run job, ticket, snapshot, channel).
- **[Channels](channels.md)**: Các bó thông báo và action tiếp theo có thể tái sử dụng, được tham chiếu từ action.
- **[Categories](categories.md)**: Tổ chức event/workflow, áp dụng action/limit mặc định, và kiểm soát khả năng hiển thị.
- **[Tags](tags.md)**: Nhãn cho event/job để tìm kiếm, lọc, giới hạn, và action có điều kiện.
- **[Buckets](buckets.md)**: Lưu trữ JSON + file bền vững để chia sẻ dữ liệu và artifact giữa các job và workflow.
- **[Secrets](secrets.md)**: Các biến được mã hoá cho job, plugin, và web hook; cách gán và truyền tải lúc runtime.

## Giám Sát & Vận Hành

- **[Servers](servers.md)**: Các worker node (xySat) thực thi job, truyền số liệu (metrics), và tham gia vào failover.
- **[Groups](groups.md)**: Các tập hợp server hợp lý để nhắm mục tiêu (targeting), action alert mặc định, và view ở cấp độ group.
- **[Monitors](monitors.md)**: Số liệu theo chuỗi thời gian ở cấp độ phút được định nghĩa bằng expression, dùng cho biểu đồ và alert.
- **[Alerts](alerts.md)**: Đánh giá dữ liệu thời gian thực trên từng server và kích hoạt action khi expression khớp.
- **[Snapshots](snapshots.md)**: Ảnh chụp trạng thái server hoặc group tại một thời điểm, dùng cho điều tra và so sánh.
- **[Tickets](tickets.md)**: Các issue/runbook nhẹ, tích hợp với job, alert, file, và automation.

## Plugin & Tích Hợp

- **[Plugins](plugins.md)**: Mở rộng PTOps bằng bất kỳ ngôn ngữ nào; API plugin cho event và monitor, tham số, và I/O.
- **[Marketplace](marketplace.md)**: Xuất bản và khám phá plugin; đóng gói, hosting, và yêu cầu.
- **[Web Hooks](webhooks.md)**: Các HTTP request gửi ra ngoài từ job và alert với header và body dùng template.
- **[System Hooks](syshooks.md)**: Chạy action tuỳ chỉnh khi có hoạt động toàn hệ thống trong PTOps.

## API & Dữ Liệu

- **[REST API](api.md)**: Các endpoint REST API, API key, xác thực, và định dạng response chuẩn.
- **[Cấu Trúc Dữ Liệu](data.md)**: Schema đầy đủ cho tất cả object của PTOps (job, event, user, server, alert, v.v.).
- **[Bảng Database](db.md)**: Danh sách tất cả các bảng database nội bộ của PTOps và chỉ mục cột.

## Truy Cập & Danh Tính

- **[Users và Roles](users.md)**: Mô hình tài khoản, role, giới hạn tài nguyên, tuỳ chọn cá nhân, và avatar.
- **[Privileges](privileges.md)**: Danh sách đầy đủ các privilege và quyền mà mỗi privilege cấp trong toàn ứng dụng.
- **[Cài Đặt SSO](sso.md)**: Tích hợp Single Sign-On và cài đặt nhà cung cấp danh tính bên ngoài.
- **[Tailscale](tailscale.md)**: Hướng dẫn cụ thể về việc sử dụng Tailscale làm nhà cung cấp SSO.

## Định Dạng File và Giao Thức

- **[Định Dạng Expression của PTOps](xyexp.md)**: Expression dựa trên JEXL và các hàm hỗ trợ được sử dụng trong toàn hệ thống.
- **[Định Dạng Portable Data của PTOps](xypdf.md)**: Định dạng truyền tải (XYPDF) để di chuyển object giữa các hệ thống.
- **[Định Dạng Backup của PTOps](xybk.md)**: Định dạng xuất/nhập hàng loạt dựa trên NDJSON, dùng bởi các công cụ quản trị.
- **[Wire Protocol của PTOps](xywp.md)**: Giao thức JSON qua STDIO cho plugin giao tiếp với PTOps/xySat.

## Hướng Dẫn Dành Cho Developer

- **[Contributing](https://github.com/pixlcore/xyops/blob/main/CONTRIBUTING.md)**: Cách đóng góp cho PTOps.
- **[Phát Triển](dev.md)**: Tổng quan kiến trúc, danh sách thành phần, framework client, và cài đặt dev cục bộ.
- **[Logging](logging.md)**: Danh sách tất cả các file log của PTOps kèm mô tả và ví dụ dòng log.
- **[Bảo Mật](security.md)**: Cách báo cáo lỗ hổng của PTOps một cách có trách nhiệm.

## Khác

- **[GitHub Project](https://github.com/pixlcore/xyops/blob/main/README.md)**: Trang chủ của repository mã nguồn mở PTOps.
- **[Code of Conduct](https://github.com/pixlcore/xyops/blob/main/CODE_OF_CONDUCT.md)**: Bộ quy tắc ứng xử Contributor Covenant.
- **[License](https://github.com/pixlcore/xyops/blob/main/LICENSE.md)**: Giấy phép mã nguồn mở BSD 3-Clause (được OSI công nhận).
- **[Trademarks](https://github.com/pixlcore/xyops/blob/main/TRADEMARKS.md)**: PTOps, xySat™ và PixlCore™ là các nhãn hiệu.
- **[Longevity](https://github.com/pixlcore/xyops/blob/main/LONGEVITY.md)**: Cam kết trường tồn dự án và giấy phép vĩnh viễn.
- **[Governance](governance.md)**: Quản trị dự án, kỳ vọng đóng góp, và quy trình ra quyết định.
- **[Colophon](colophon.md)**: Chúng tôi đứng trên vai những người khổng lồ này.
