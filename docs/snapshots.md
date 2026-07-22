# Snapshots

## Tổng Quan

Snapshot chụp lại một cái nhìn tại một thời điểm về mọi thứ đang diễn ra trên một server (hoặc trên toàn bộ một server group). Chúng được thiết kế để điều tra nhanh (forensics), so sánh song song (trước/sau một lần deploy, trong lúc xảy ra sự cố), và lưu vết audit lâu dài.

Trang này giải thích snapshot là gì, chúng chứa gì, cách tạo chúng (thủ công hoặc tự động), watch hoạt động thế nào, và một số mẹo để sử dụng chúng hiệu quả.

## Điểm Chính

- Một snapshot ghi lại trạng thái hiện tại của một server (process, connection, mount, device, metric, job, alert, và nhiều hơn nữa).
- Group snapshot ghi lại toàn bộ một group cùng lúc (tất cả member hiện tại, cộng với server mới offline gần đây), cho phép điều tra ở cấp độ toàn fleet.
- Snapshot có thể được tạo thủ công trong UI, qua API, hoặc tự động qua Action (trên job/alert) và Watch (mỗi phút trong một khoảng thời gian).
- Snapshot hiển thị trên trang Snapshots và được liên kết từ server, group, job và alert.
- Snapshot được giữ lại đến một giới hạn toàn cục (mặc định 100,000) và được dọn dẹp mỗi đêm. Xem [Servers → Snapshots and Watches](servers.md#snapshots-and-watches).

## Snapshot Chứa Gì

Tất cả server snapshot bao gồm một record với các nội dung sau:

- Minute sample: Một bản copy đầy đủ của [ServerMonitorData](data.md#servermonitordata) hiện tại, bao gồm:
  - CPU, memory, load, OS/platform/release/arch, uptime.
  - Danh sách process đầy đủ và số liệu thống kê process.
  - Kết nối mạng đang hoạt động (bao gồm listener).
  - Network interface và thống kê; disk mount và thống kê filesystem.
  - Monitor (giá trị đã tính toán) và delta; output plugin thô.
- Quick metrics: 60 giây gần nhất của các mẫu "quick" theo giây (`quickmon`) cho CPU/mem/disk/net ([QuickmonData](data.md#quickmondata)).
- Context: ID của job và alert đang hoạt động tại thời điểm chụp. Đối với workflow sub-job, parent có thể được bao gồm để làm context.

Group snapshot thêm context toàn fleet:

- Tất cả member hiện tại (online) cộng với server mới offline gần đây (trong vòng 1 giờ qua), được đánh dấu trạng thái online/offline.
- Object [ServerMonitorData](data.md#servermonitordata) cho mỗi server, khớp 1:1 với `servers`.
- Mẫu quick 60 giây cho mỗi server, khớp 1:1 với `servers`.
- Alert và job đang hoạt động liên quan đến bất kỳ server member nào tại thời điểm chụp.

Xem đầy đủ hình dạng object trong [Data → Snapshot](data.md#snapshot) và [Data → GroupSnapshot](data.md#groupsnapshot).

## Tạo Snapshot

Bạn có thể tạo snapshot theo nhiều cách:

- **Thủ Công (UI)**
  - Server: Mở trang server và nhấn "Snapshot".
  - Group: Mở trang group và nhấn "Snapshot".
- **Tự Động Qua Action**
  - Thêm một Snapshot action vào job hoặc alert (xem [Actions](actions.md)).
  - Job: Job phải nhắm mục tiêu một server cụ thể; snapshot được chụp trên server đó.
  - Alert: Snapshot được chụp trên server của alert khi action được kích hoạt.
- **Qua API**
  - Server: `create_snapshot` -- xem [API → create_snapshot](api.md#create_snapshot).
  - Group: `create_group_snapshot` -- xem [API → create_group_snapshot](api.md#create_group_snapshot).

Quyền: Tạo snapshot (UI hoặc API) yêu cầu privilege [create_snapshots](privileges.md#create_snapshots).

## Watches

Watch chỉ đạo PTOps chụp snapshot mỗi phút trong một khoảng thời gian cụ thể. Dùng chúng để chụp các vấn đề ngắn hạn hoặc quan sát thay đổi trong lúc triển khai (rollout).

- **Server Watch**
  - Đặt từ trang server (UI) hoặc API: [watch_server](api.md#watch_server).
  - Snapshot được chụp khi dữ liệu phút của server đó đến (mỗi offset phút của server được lệch giờ có chủ đích trên toàn fleet).
  - Hủy bằng cách đặt thời gian là `0` (UI hoặc API). UI mặc định 5 phút.
- **Group Watch**
  - Đặt từ trang group (UI) hoặc API: [watch_group](api.md#watch_group).
  - Snapshot chạy một lần mỗi phút ở mốc giây :30, chụp tất cả server khớp bằng mẫu phút gần nhất của chúng.
  - Server mới offline gần đây (trong vòng 1 giờ qua) được bao gồm và đánh dấu offline.

Ghi chú:

- Lệch giờ (staggering): Việc thu thập theo phút được lệch giờ trên các server để trải đều tải; thời gian chụp snapshot của server watch sẽ phản ánh offset của từng server.
- Nguồn gốc (provenance): Snapshot được tạo tự động ghi `source` là `watch`; snapshot tạo thủ công ghi `source` là `user` và bao gồm `username`.

## Xem và Tìm Kiếm

- UI: Nhấn "Snapshots" ở sidebar; snapshot cũng được liên kết từ trang server và group, và từ activity của job/alert khi action tạo ra chúng.
- Tìm kiếm API: Dùng [search_snapshots](api.md#search_snapshots) để lọc và phân trang lịch sử snapshot.

## Xử Lý Sự Cố và Mẹo

- Ưu tiên watch cho vấn đề tạm thời: Nếu vấn đề diễn ra theo cụm (bursty) hoặc ngắn hạn, bắt đầu một watch ngắn (ví dụ 5-10 phút) thay vì chụp một snapshot thủ công đơn lẻ.
- Đồng bộ thời gian với event: Đối với so sánh trước/sau, chụp một cái trước và một cái sau thay đổi của bạn; ghi lại liên kết trong ticket hoặc ghi chú job liên quan.
- Job gây rắc rối? Gán snapshot action cả lúc job start *và* job complete, để so sánh sự khác biệt của server.
- Hiểu dữ liệu theo phút vs. theo giây: Trạng thái cốt lõi là [ServerMonitorData] ở độ chi tiết theo phút; buffer `quickmon` thêm 60 giây trước đó của context theo giây.
- Thời điểm group snapshot: Group watch chạy ở giây :30; server gửi mẫu phút theo offset lệch giờ. Group snapshot dùng mẫu phút gần nhất được lưu cho mỗi server.
- Host mới offline gần đây: Group snapshot bao gồm host mới offline gần đây (1 giờ qua) và đánh dấu offline để bạn vẫn thấy trạng thái được biết cuối cùng của chúng.
- Quyền: Nếu bạn không thấy điều khiển snapshot hoặc lệnh API thất bại, đảm bảo user hoặc API Key của bạn có [create_snapshots](privileges.md#create_snapshots).

## Tìm Hiểu Thêm

- Đối Tượng Dữ Liệu: [Snapshot](data.md#snapshot), [GroupSnapshot](data.md#groupsnapshot), [ServerMonitorData](data.md#servermonitordata), [QuickmonData](data.md#quickmondata)
- Lệnh API: [create_snapshot](api.md#create_snapshot), [watch_server](api.md#watch_server), [create_group_snapshot](api.md#create_group_snapshot), [watch_group](api.md#watch_group), [search_snapshots](api.md#search_snapshots)
- Xem Thêm: [Servers](servers.md), [Groups](groups.md), [Actions](actions.md)
