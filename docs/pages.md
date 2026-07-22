# Mô Tả Trang

Tài liệu này chứa mô tả ngắn cho từng trang cấp cao nhất. Chúng được hiển thị trong giao diện nếu người dùng bật tuỳ chọn tương ứng.

## Search

Các job đã hoàn thành được lưu lại để phân tích, xử lý sự cố, và kiểm toán. Lịch sử job bao gồm kết quả, thời gian, tham số, log, dữ liệu output, và file, giúp bạn kiểm chứng hành vi và so sánh kết quả giữa các lần chạy.

Trang Job Search cho phép bạn duyệt và lọc lịch sử này. Thu hẹp theo kết quả (success, error, warning, critical, aborted), event hoặc workflow, category, tag, nguồn (scheduler, manual, API key, workflow, action, alert, plugin), plugin, server, group, và khoảng thời gian. Bạn cũng có thể tìm kiếm trong log và file văn bản đính kèm bằng văn bản thường hoặc biểu thức chính quy, có thể phân biệt hoa/thường.

Lưu các truy vấn thường dùng thành preset xuất hiện ở sidebar để truy cập nhanh. Preset được lưu theo từng người dùng, nên bạn có thể giữ quy trình riêng mà không ảnh hưởng đến người khác.

Xem thêm: [Events](events.md), [Workflows](workflows.md), [Tags](tags.md).

## Tickets

**Ticket** là các bản ghi nhẹ dùng để theo dõi issue, feature, release, thay đổi, bảo trì, và câu hỏi. Chúng ghi lại subject, body, danh sách assignee và CC, ngày due tuỳ chọn, tag, và file, và có thể liên kết đến các tài nguyên tự động hoá bao gồm event, job, và alert.

Trang Ticket Search giúp bạn tìm và quản lý công việc này. Nhấn "**New Ticket**" để tạo mới, hoặc tìm kiếm toàn văn trong body, theo type, status (open, closed, draft), assignee, tác giả, category, server, tag, và khoảng thời gian.

Ticket có thể nhúng các event có thể chạy được, để bạn khởi chạy job trực tiếp từ ticket. File đính kèm sẽ được đưa vào các job đó như input, và output được liên kết ngược lại để dễ truy vết.

Xem thêm: [Tickets](tickets.md).

## Events

**Event** định nghĩa cách job chạy: chạy code gì (plugin và tham số), chạy ở đâu (target và thuật toán chọn), chạy khi nào (trigger), và phản ứng ra sao (action và limit). Mỗi lần event chạy sẽ tạo ra một job với đầy đủ trạng thái lifecycle được theo dõi.

Trang Event List cho phép bạn duyệt, tìm kiếm, và quản lý event. Nhấn "**New Event**" để thêm mới, hoặc lọc theo từ khoá (title), trạng thái (enabled hoặc disabled), category, target (group hoặc server), plugin, tag, trigger, action, hoặc tác giả. Mở bất kỳ event nào để xem hoặc chỉnh sửa cấu hình.

Giá trị mặc định của category sẽ được gộp vào job của event, và limit/action riêng của từng event có thể tinh chỉnh hành vi. Thêm một trigger manual nếu bạn muốn chạy theo yêu cầu qua UI hoặc API.

Xem thêm: [Events](events.md), [Categories](categories.md), [Plugins](plugins.md).

## Workflows

**Workflow** là các đồ thị trực quan điều phối nhiều job với luồng điều khiển. Chúng kết nối trigger, node event hoặc job, controller, action, và limit để thể hiện tính song song, phân nhánh, fan-out, và fan-in.

Trang Workflow List hiển thị tất cả event dạng workflow. Nhấn "**New Workflow**" để tạo workflow mới, hoặc lọc các workflow hiện có theo từ khoá (title), trạng thái (enabled hoặc disabled), category, target (group hoặc server), tag, trigger, action, hoặc tác giả để tìm đúng thứ bạn cần.

Các controller phổ biến gồm split, join, repeat, multiplex, decision, và wait. Trình chỉnh sửa hỗ trợ test với input tuỳ chỉnh và có thể tắt action hoặc limit khi test.

Xem thêm: [Workflows](workflows.md).

## Categories

**Category** là các nhóm do người dùng định nghĩa cho event và workflow. Chúng giúp tổ chức automation, kiểm soát khả năng hiển thị, và áp dụng action/limit mặc định cho tất cả job bên trong category.

Trang Category List cho phép bạn tạo và quản lý category. Đặt title, màu, icon, ghi chú, cờ enabled, và thứ tự sắp xếp. Bạn có thể import/export và sắp xếp lại category theo bố cục mong muốn.

Giá trị mặc định từ category sẽ gộp vào các lần chạy job, giúp chuẩn hoá thông báo và chính sách tài nguyên. Disable một category sẽ ngăn việc lập lịch và chạy thủ công cho mọi thứ bên trong nó.

Xem thêm: [Categories](categories.md), [Actions](actions.md), [Limits](limits.md).

## Buckets

**Storage Bucket** là nơi lưu trữ bền vững cho dữ liệu JSON và file mà job và workflow có thể chia sẻ. Chúng hữu ích cho việc chuyển giao dữ liệu giữa các job, lưu artifact, và duy trì trạng thái chia sẻ lâu dài.

Trang Storage Bucket List cho phép bạn tạo bucket, chỉnh sửa panel dữ liệu JSON, và upload hoặc download file. Bạn có thể thay thế hoặc xoá object khi cần, với việc chuẩn hoá tên file và giới hạn kích thước/số lượng được server thực thi.

Job có thể fetch từ bucket lúc bắt đầu và lưu dữ liệu hoặc file khi hoàn thành qua action, cho phép sự kết hợp lỏng giữa các tiến trình và team.

Xem thêm: [Buckets](buckets.md).

## Tags

**Tag** là các nhãn có thể tái sử dụng mà bạn có thể gắn vào event, job, và ticket. Chúng cung cấp gợi ý trực quan nhanh, cho phép tìm kiếm mạnh mẽ, và có thể điều khiển automation có điều kiện.

Trang Tag List cho phép bạn tạo, chỉnh sửa, và xoá định nghĩa tag với title, icon tuỳ chọn, và ghi chú. Tag ID là khoá tham chiếu được action và plugin sử dụng.

Action có thể được điều kiện hoá theo tag có mặt khi job hoàn thành, và plugin có thể push tag lúc runtime để đánh dấu job.

Xem thêm: [Tags](tags.md).

## Alerts

**Alert** liên tục đánh giá dữ liệu server thời gian thực và kích hoạt khi điều kiện được thoả mãn. Định nghĩa alert chỉ định scope, expression, message, và action; mỗi lần kích hoạt trở thành một invocation với lifecycle riêng.

Trang Alert Search hiển thị các invocation đang hoạt động và trong lịch sử để bạn xem xét điều kiện, thời gian, và các action tiếp theo. Lọc theo định nghĩa alert, server, group, và khoảng thời gian để khoanh vùng sự cố hoặc xu hướng.

Khi kích hoạt hoặc xoá, action có thể thông báo channel, tạo ticket, chạy event, và chụp snapshot. Alert cũng có thể chặn job mới hoặc hủy job đang chạy trên các server bị ảnh hưởng.

Xem thêm: [Alerts](alerts.md).

## Servers

**Server** là các worker node thực thi job và thu thập số liệu. Mỗi server chạy agent xySat, duy trì kết nối với conductor, và báo cáo thông tin host cùng dữ liệu giám sát.

Trang Server List hiển thị đội máy đang hoạt động với label, hostname, IP, thông tin OS và CPU, và trạng thái. Lọc theo từ khoá và thuộc tính platform, dùng "**Search History**" cho các server offline, hoặc nhấn "**Add Server**" để tạo lệnh cài đặt một dòng cho Docker, Linux, macOS, hoặc Windows.

Mở một server sẽ hiển thị biểu đồ trực tiếp và lịch sử, các process và kết nối mạng hiện tại, job đang chạy và sắp chạy, và alert đang hoạt động cùng liên kết đến chi tiết.

Xem thêm: [Servers](servers.md).

## Groups

**Server Group** tổ chức các server thành các tập hợp logic dùng để targeting, dashboard, và giới hạn phạm vi alert. Việc trở thành thành viên có thể tự động qua regex hostname hoặc gán thủ công cho từng server.

Trang Server Group List cho phép bạn tạo, chỉnh sửa, và sắp xếp lại group. Nhấn "**New Group**" để thêm mới, đặt hostname match tuỳ chọn, ghi chú, và action alert mặc định.

Mở một group sẽ hiển thị biểu đồ tổng hợp, process và kết nối trên tất cả thành viên, job đang chạy và sắp chạy, alert, và các control để chụp snapshot và đặt watch.

Xem thêm: [Server Groups](groups.md).

## Snapshots

**Snapshot** chụp một góc nhìn tại một thời điểm của server hoặc cả một group, bao gồm số liệu, process, kết nối, và bối cảnh như job và alert. Chúng lý tưởng cho việc điều tra và so sánh trước/sau.

Trang Snapshot History liệt kê các bản ghi đã chụp. Lọc theo nguồn (alert, user, watch, job), server, group, và khoảng thời gian để xác định các mục và xu hướng liên quan.

Mở một snapshot sẽ hiển thị dữ liệu server hoặc group đã được đóng băng cùng số liệu nhanh và monitor theo phút, process, kết nối, job, và alert tại đúng thời điểm chụp.

Xem thêm: [Snapshots](snapshots.md).

## MyAccount

Hồ sơ tài khoản của bạn bao gồm danh tính, thông tin xác thực, role, và avatar. Cập nhật thông tin này giúp người khác nhận ra bạn trong log hoạt động và danh sách.

Trang My Account cho phép bạn đổi tên hiển thị, địa chỉ email, và mật khẩu, và upload hoặc thay ảnh avatar. Bạn cũng có thể chọn icon hiển thị cạnh tên trong UI.

Trang này hiển thị các role bạn được gán để bạn hiểu quyền hiệu lực của mình một cách nhanh chóng.

## MySettings

Tuỳ chọn cá nhân kiểm soát giao diện, cảm giác, và hành vi của UI cho tài khoản của bạn. Chúng bao gồm bản địa hoá, khả năng tiếp cận, thông báo, media, và phím tắt.

Trang My Settings cho phép bạn cấu hình locale, region, timezone, định dạng số, và hour cycle. Bạn có thể điều chỉnh motion, contrast, khả năng tiếp cận thị giác, thông báo, hiệu ứng hình ảnh, và streamer mode, cùng với volume, độ sáng, độ tương phản, hue, và saturation.

Phím tắt có thể được tuỳ chỉnh để làm việc hiệu quả hơn. Cài đặt sẽ theo tài khoản của bạn và áp dụng trên mọi thiết bị.

## MySecurity

Log an ninh cá nhân của bạn hiển thị hoạt động tài khoản như đăng nhập và các thay đổi nhạy cảm. Mỗi mục bao gồm metadata như địa chỉ IP và user agent.

Trang My Security cho phép bạn kiểm tra lại lịch sử này và xác nhận các hành động gần đây là hợp lệ. Đây là thói quen tốt nên thực hiện định kỳ.

Dùng Logout All Sessions để vô hiệu hoá mọi session khác trong khi vẫn giữ session hiện tại hoạt động.

## ActivityLog

Log hoạt động hệ thống ghi lại các lệnh tạo, cập nhật, xoá, đăng nhập người dùng, hành động an ninh, và thay đổi kết nối server. Nó cung cấp một audit trail cho quản trị viên.

Trang Activity Log hiển thị lịch sử này với tìm kiếm và bộ lọc để bạn khoanh vùng hành động theo người dùng, loại đối tượng, hoặc khoảng thời gian. Mỗi mục bao gồm metadata hữu ích cho việc điều tra.

Dùng trang này cho việc xem xét thay đổi, kiểm toán tuân thủ, và xử lý sự cố các hoạt động quản trị trên toàn hệ thống.

## AlertSetup

Định nghĩa alert mô tả cái gì cần theo dõi trên server và cần làm gì khi điều kiện được thoả mãn. Mỗi định nghĩa bao gồm scope, một expression, một message, và action cho lúc fire và clear.

Trang Alert Setup liệt kê và quản lý các định nghĩa này. Nhấn "**New Alert**" để tạo mới, test expression với dữ liệu thực, và cấu hình số sample warm-up/cool-down, overlay, và các tuỳ chọn khác.

Alert có thể thông báo channel, tạo ticket, chạy event, chụp snapshot, và tuỳ chọn giới hạn hoặc hủy job trên các server bị ảnh hưởng khi đang hoạt động.

Xem thêm: [Alerts](alerts.md).

## APIKeys

**API Key** là token truy cập cho việc sử dụng REST API theo hướng tự động hoá. Chúng giống như tài khoản người dùng đặc biệt cho ứng dụng, với privilege có thể gán và tuỳ chọn cấp role.

Trang API Keys cho phép bạn tạo và quản lý key. Nhấn "**New API Key**" để đặt title, mô tả, privilege, role, và ngày hết hạn tuỳ chọn. Key có thể bị disable hoặc xoá bất cứ lúc nào.

Giá trị key chỉ được hiển thị một lần và sau đó được lưu dưới dạng hash SHA-256 có salt. Nên giới hạn phạm vi key hẹp và đặt hạn dùng khi phù hợp.

Xem thêm: [API Reference](api.md).

## Channels

**Notification Channel** đóng gói nhiều action như gửi email cho người dùng, kích hoạt web hook, chạy event khắc phục, và hiển thị thông báo trong app kèm âm thanh. Việc tham chiếu một channel giúp phản hồi luôn nhất quán.

Trang Channels cho phép bạn định nghĩa và quản lý các bó này. Nhấn "**New Channel**" để chọn người dùng, email ngoài, web hook, event chạy tuỳ chọn, âm thanh tuỳ chọn, và giới hạn mỗi ngày tuỳ chọn.

Channel thực thi các sub-action song song và ghi lại kết quả để kiểm toán. Dùng icon và title ngắn gọn để dễ nhận diện.

Xem thêm: [Channels](channels.md).

## Conductors

**Conductor** là các server scheduler chính của PTOps, điều phối việc khởi chạy job, thu nạp dữ liệu, lưu trữ, và UI. Một cluster có thể chạy nhiều conductor để dự phòng; chỉ một trong số đó là primary tại bất kỳ thời điểm nào.

Trang Conductors hiển thị các server này và cho biết cái nào là primary và cái nào online hoặc offline. Điều này giúp xác nhận tính dự phòng và trạng thái election.

Dùng góc nhìn này để xem trạng thái server hoặc restart / shutdown conductor.

Xem thêm: [Servers](servers.md).

## Monitors

**Monitor** theo dõi một số liệu duy nhất trên mỗi server theo thời gian, được tính từ dữ liệu trực tiếp nhận mỗi phút. Chúng cấp dữ liệu cho biểu đồ trên trang server và group, và có thể nuôi alert.

Trang Monitors cho phép bạn định nghĩa các số liệu này. Nhấn "**New Monitor**" để cung cấp expression, kiểu dữ liệu, trích xuất regex tuỳ chọn, và tuỳ chọn delta hoặc rate. Bạn có thể giới hạn phạm vi monitor cho các group cụ thể.

Monitor được tinh chỉnh tốt sẽ tạo ra hình ảnh trực quan rõ ràng và điều kiện alert ổn định cho việc theo dõi công suất và hiệu năng.

Xem thêm: [Monitors](monitors.md), [Alerts](alerts.md).

## Plugins

**Plugin** mở rộng PTOps với logic tuỳ chỉnh viết bằng bất kỳ ngôn ngữ nào. Event plugin chạy code job trên server, action plugin chạy trên conductor để phản hồi action của job hoặc alert, monitor plugin xuất số liệu, và trigger plugin quyết định khi nào chạy event.

Trang Plugins liệt kê các plugin đã cài và cho phép bạn thêm plugin mới. Nhấn "**New Plugin**" để tạo và cấu hình tham số, icon, và ghi chú cho một loại plugin.

Plugin có thể nhận tham số, tương tác với secret, push cập nhật trong lúc chạy, và gắn file hoặc dữ liệu vào job.

Xem thêm: [Plugins](plugins.md).

## Secrets

**Secret** là các vault mã hoá chứa biến key/value như token và mật khẩu. Chúng được chuyển an toàn đến job và web hook lúc runtime mà không để lộ plaintext khi lưu trữ.

Trang Secrets cho phép quản trị viên tạo secret, định nghĩa biến, và gán phạm vi sử dụng cho event, category, plugin, hoặc web hook. Enable hoặc disable secret mà không cần xoá, và chỉ giải mã giá trị khi cần thiết.

Lúc runtime, job nhận biến secret dưới dạng biến môi trường và web hook mở rộng chúng trong template. Việc sử dụng được ghi log và việc giải mã của quản trị viên được kiểm toán.

Xem thêm: [Secrets](secrets.md).

## System

Trang trạng thái và bảo trì hệ thống cung cấp góc nhìn tổng quan về sử dụng tài nguyên và cung cấp các hành động quản trị theo yêu cầu. Điều này giúp bạn đánh giá tình trạng và thực hiện bảo trì định kỳ.

Trang này hiển thị CPU và memory của process, memory và dung lượng đĩa của database, đối tượng cache và mức sử dụng, và số dòng DB. Nó cũng liệt kê các job nội bộ đang chạy và người dùng đang kết nối cùng IP, trang hiện tại, thời gian session, và ping RTT.

Các hành động bảo trì bao gồm import, export, và xoá dữ liệu hàng loạt, chạy bảo trì đêm, tối ưu database, reset số liệu ngày, upgrade server worker và master, và xoay secret key.

## Users

**User** là các tài khoản riêng lẻ đăng nhập vào UI và API. Quyền hạn đến từ privilege trực tiếp và role được gán, và quyền truy cập có thể bị giới hạn trong các category và group cụ thể.

Trang Users liệt kê tài khoản và cung cấp công cụ để tạo, chỉnh sửa, suspend, unlock, và xoá. Nhấn "**New User**" để đặt các trường danh tính, mật khẩu ban đầu, privilege, và role.

Dùng khu vực này để quản lý onboarding và quyền truy cập liên tục, bao gồm avatar, đổi mật khẩu, và giới hạn tài nguyên.

Xem thêm: [Users and Roles](users.md).

## Roles

**User Role** đóng gói privilege và giới hạn tài nguyên tuỳ chọn để bạn cấp quyền một cách nhất quán. Gán role cho user để tránh phải quản lý hàng chục privilege cho mỗi tài khoản.

Trang Roles cho phép bạn tạo và quản lý các bó này. Nhấn "**New Role**" để định nghĩa privilege và giới hạn category hoặc group tuỳ chọn, rồi enable để sử dụng.

Thay đổi role sẽ ảnh hưởng đến user được gán và có hiệu lực ngay sau khi lưu. Dùng role để chuẩn hoá chính sách trên toàn team.

Xem thêm: [Users and Roles](users.md).

## WebHooks

**Web Hook** là các HTTP request gửi ra ngoài để tích hợp job và alert với hệ thống bên ngoài như chat, công cụ xử lý sự cố, hoặc endpoint tuỳ chỉnh. Chúng có thể tuỳ chỉnh hoàn toàn và hỗ trợ templating.

Trang Web Hooks cho phép bạn tạo định nghĩa với URL, method, header, body tuỳ chọn, timeout, số lần retry, xử lý redirect, giới hạn mỗi ngày, và tuỳ chọn TLS. Nhấn "**New Web Hook**" để bắt đầu.

Template có thể bao gồm bối cảnh job hoặc alert và tham chiếu các secret được gán cho token hoặc thông tin xác thực. Việc thực thi được ghi lại thời gian và kết quả thành công để xử lý sự cố.

Xem thêm: [Web Hooks](webhooks.md).

## Marketplace

**PTOps Marketplace** cho phép bạn tải xuống và cài đặt plugin do PixlCore và cộng đồng tạo ra. Tất cả plugin đều được PixlCore kiểm tra trước khi công bố để đảm bảo chất lượng và an toàn, nhưng luôn cẩn trọng khi tải phần mềm từ internet.

Marketplace thực ra không "host" plugin -- nó chỉ cung cấp cơ chế tìm kiếm để phát hiện chúng. Các plugin thực sự được host trên các package repository như NPM, PyPI hoặc GitHub, và marketplace liên kết trực tiếp đến chúng.

Để bảo vệ quyền riêng tư của bạn, các request không bao giờ gửi đến server PixlCore / PTOps. Thay vào đó, mọi thứ được host hoàn toàn trên GitHub, bao gồm cả chỉ mục marketplace.

Xem thêm: [Marketplace](marketplace.md).
