# Privileges

## Tổng Quan

PTOps dùng một hệ thống privilege đơn giản, linh hoạt để kiểm soát quyền truy cập vào các tính năng. Privilege có thể được gán trực tiếp cho User và API Key, và Role có thể đóng gói các bộ privilege sau đó được gắn cho User và API Key. Bộ quyền hiệu lực là hợp của tất cả privilege được gán trực tiếp cộng với những privilege được cấp bởi bất kỳ role nào. Privilege đặc biệt `admin` cấp toàn quyền truy cập vào tất cả tính năng. Loại bỏ tất cả privilege sẽ tạo ra một user "chỉ đọc" trên thực tế.

Lưu ý: Một số hoạt động cũng thực thi kiểm soát truy cập ở cấp resource (ví dụ giới hạn category, group, hoặc target). Có privilege là cần thiết, nhưng một số hành động có thể còn yêu cầu quyền truy cập vào resource cụ thể.

## Đặc Biệt

### admin
Toàn quyền quản trị; bao hàm tất cả privilege và bỏ qua các giới hạn thông thường.

### bulk_export
Cho phép xuất dữ liệu hàng loạt dùng API [admin_export_data](api.md#admin_export_data).

## Alerts

### create_alerts
Tạo alert definition mới đánh giá dữ liệu monitor và kích hoạt action.

### edit_alerts
Sửa alert definition hiện có, bao gồm expression, message, và cài đặt.

### delete_alerts
Xóa alert definition và loại bỏ cấu hình liên quan.

## Buckets

### create_buckets
Tạo storage bucket mới để lưu artifact hoặc dữ liệu có cấu trúc.

### edit_buckets
Sửa bucket hiện có, bao gồm metadata, payload dữ liệu, và danh sách file.

### delete_buckets
Xóa bucket, bao gồm tất cả dữ liệu và file liên quan.

## Categories

### create_categories
Tạo category event mới định nghĩa giá trị mặc định và tổ chức.

### edit_categories
Sửa category hiện có và giá trị mặc định của chúng (limit, action, màu sắc, v.v.).

### delete_categories
Xóa category khỏi hệ thống (tuỳ theo các tham chiếu và sử dụng thông thường).

## Channels

### create_channels
Tạo channel thông báo gửi ra (ví dụ đích email, web hook).

### edit_channels
Sửa channel thông báo hiện có và cài đặt gửi của chúng.

### delete_channels
Xóa channel thông báo khỏi hệ thống.

## Events

### create_events
Tạo event và workflow mới, bao gồm lịch, target, và cài đặt plugin.

### edit_events
Sửa event và workflow hiện có, bao gồm lịch, limit, action, và tham số.

### delete_events
Xóa event và workflow (tuỳ chọn bao gồm job liên quan nếu áp dụng).

## Groups

### create_groups
Tạo server group mới để tổ chức và nhắm mục tiêu server.

### edit_groups
Sửa server group hiện có, bao gồm tiêu đề, quy tắc, và cài đặt alert.

### delete_groups
Xóa server group khỏi hệ thống.

## Jobs

### run_jobs
Chạy event theo yêu cầu và upload file input trước khi chạy cho job.

### abort_jobs
Hủy job đang chạy.

### delete_jobs
Xóa job và file hoặc log liên quan (nếu áp dụng).

### tag_jobs
Thêm hoặc cập nhật tag trên job đã hoàn thành.

## Monitors

### create_monitors
Tạo monitor mới thu thập và xử lý số liệu server hoặc ứng dụng.

### edit_monitors
Sửa monitor hiện có, bao gồm expression, quy tắc khớp, và cài đặt.

### delete_monitors
Xóa monitor khỏi hệ thống.

## Plugins

### create_plugins
Tạo plugin mới (loại event, monitor, action, hoặc scheduler).

### edit_plugins
Sửa định nghĩa plugin hiện có và cấu hình của chúng.

### delete_plugins
Xóa plugin khỏi hệ thống.

## Roles

### create_roles
Tạo role mới đóng gói các bộ privilege.

### edit_roles
Sửa role hiện có, bao gồm tiêu đề và privilege được gán.

### delete_roles
Xóa role khỏi hệ thống.

## Tags

### create_tags
Tạo tag hệ thống để tổ chức event, job, và dữ liệu liên quan.

### edit_tags
Sửa tag hiện có.

### delete_tags
Xóa tag khỏi hệ thống.

## Tickets

### create_tickets
Tạo ticket mới để theo dõi task, review, hoặc theo dõi tiếp.

### edit_tickets
Sửa ticket hiện có, bao gồm chủ đề, chi tiết, người được gán, và trạng thái.

### delete_tickets
Xóa ticket khỏi hệ thống.

## Web Hooks

### create_web_hooks
Tạo web hook mới cho thông báo gửi ra và tích hợp.

### edit_web_hooks
Sửa web hook hiện có và chi tiết request của chúng.

### delete_web_hooks
Xóa web hook khỏi hệ thống.

## Servers

### add_servers
Thêm server mới theo yêu cầu trên UI, và cũng cho phép API đăng ký server tạm thời (ephemeral) một cách động.

### update_servers
Cập nhật metadata server, như tiêu đề (label), icon, group, và dữ liệu user.

### create_snapshots
Tạo snapshot server theo yêu cầu và đặt/hủy watch lấy snapshot định kỳ.

### delete_snapshots
Xóa snapshot server hoặc group khỏi hệ thống.

## Khác

### send_emails
Gửi email tuỳ chỉnh dùng API [send_email](api.md#send_email).
