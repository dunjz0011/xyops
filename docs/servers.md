# Servers

## Tổng Quan

Server là các worker node trong cluster PTOps. Mỗi server chạy satellite agent nhẹ của chúng ta (xySat), duy trì kết nối WebSocket liên tục với conductor, thu thập số liệu giám sát, và thực thi job theo yêu cầu. Một server có thể là máy vật lý, máy ảo, hoặc container, và có thể chạy Linux, macOS, hoặc Windows.

Tài liệu này giải thích server phù hợp với PTOps thế nào, cách thêm và tổ chức chúng, cách event target server, những gì bạn thấy trên trang UI của mỗi server, và cách hệ thống mở rộng cho các fleet lớn.

## Điểm Chính

- Server chạy xySat và đóng vai trò job runner và bộ thu thập metrics.
- Conductor chạy toàn bộ stack PTOps và điều phối scheduling, routing, storage, và UI.
- Bạn có thể thêm bất kỳ số lượng server và conductor vào cluster; agent duy trì kết nối trực tiếp và tự failover giữa các conductor.
- Server thu thập metrics "quick" mỗi giây (CPU/Mem/Disk/Net) và metrics cấp phút qua các monitor plugin do người dùng định nghĩa. Một số metrics không có sẵn trên Windows.

## Server vs. Conductor

- **Server**: Một worker node chạy xySat. Nó báo cáo chi tiết host và metrics, và thực thi job được gửi từ conductor. Server có thể được nhóm và target bởi event.
- **Conductor**: Một instance PTOps đầy đủ (primary hoặc hot standby) quản lý schedule, định tuyến job đến server, lưu trữ dữ liệu, và phục vụ UI/API. Một cluster có thể có nhiều conductor để đảm bảo dự phòng; luôn có một conductor là primary tại một thời điểm.

xySat luôn giữ danh sách cập nhật của tất cả conductor. Nếu một server mất kết nối primary, nó tự động failover sang backup và sau đó kết nối lại với primary mới sau khi bầu chọn (election).

## Thêm Server

Bạn có thể thêm server theo ba cách:

1. **Qua UI** (bộ cài đặt một dòng lệnh)
	- Vào tab Servers và nhấn "Add Server…".
	- Tuỳ chọn đặt label, icon, trạng thái enabled, và chọn group (hoặc để tự động nhóm).
	- Sao chép lệnh cài đặt một dòng đã cấu hình sẵn cho Docker, Linux, macOS hoặc Windows và chạy nó trên host đích.
	- Bộ cài đặt sẽ xác thực, cài xySat làm startup service (systemd/launchd/Windows Service), ghi cấu hình, và khởi động agent.
	- Server xuất hiện ngay trong cluster, bắt đầu truyền metrics, và có thể chạy job.
2. **Bootstrap tự động** (API Key)
	- Với autoscaling hoặc host tạm thời (ephemeral), tạo một API Key và dùng hệ thống provisioning của bạn để gọi endpoint bootstrap, lấy server token và lệnh cài đặt trong quá trình khởi động lần đầu.
	- Xem chi tiết dưới đây. Bạn có thể đưa việc này vào cloud-init, AMI, Packer template, hoặc script khởi động tuỳ chỉnh.
3. **Cài đặt thủ công**
	- Cài xySat trên host và cấu hình với URL cluster và secret key của bạn. Secret key được dùng để tạo auth token. Khởi động service để tham gia cluster.
	- Phương pháp này thường chỉ dùng cho phát triển, testing và home lab.

Lưu ý:

- Auth token của server không hết hạn. Tuy nhiên, bạn có thể [xoay secret key](hosting.md#secret-key-rotation) (sẽ tạo lại toàn bộ token) từ UI nếu cần.
- Việc nâng cấp phần mềm xySat được điều phối từ UI và được thiết kế để tránh làm gián đoạn job đang chạy.

### Bootstrap Server Tự Động

Để tự động thêm server tạm thời (ephemeral) mới vào cluster, làm theo các bước sau:

Trước tiên, tạo một [API Key](api.md#api-keys) mới trong UI, và chỉ gán cho nó privilege [add_servers](privileges.md#add_servers) (bỏ hết các privilege mặc định khác).

Tiếp theo, nhấn "Add Server" trong UI và sao chép lệnh cài đặt Linux. Không nhập bất kỳ tuỳ chọn server nào như label, icon hay group.

Thay thế auth token tạm thời (hết hạn sau 24 giờ) bằng API Key mới của bạn (không hết hạn). Token là giá trị của query string parameter `t` trong URL. Ví dụ:

```sh
curl -s "https://xyops01.mycompany.com/api/app/satellite/install?t=API_KEY_HERE" | sudo sh
```

Cuối cùng, dán lệnh mới vào script provisioning server của bạn, cụ thể là trong chuỗi khởi động lần đầu (first-boot), để nó chạy khi khởi động ban đầu.

Lưu ý:

- Đảm bảo network stack của server mới đã sẵn sàng trước khi chạy lệnh bootstrap.
- Sau lần tải đầu tiên, xySat sẽ cài từ cache cục bộ và không cần truy cập internet cho bất cứ thứ gì nữa (hoặc chỉ cần dùng [Air-Gapped Mode](hosting.md#air-gapped-mode)).
- Đảm bảo server của bạn đã cài sẵn `curl`. Ngoài ra bạn có thể viết lại lệnh để dùng `wget`.
- Ở chế độ tự động, hostname của server sẽ quyết định nó được thêm vào group server nào.

### Docker Worker Tự Động

Để tự động thêm Docker worker mới vào cluster, làm theo các bước sau:

Trước tiên, tạo một [API Key](api.md#api-keys) mới trong UI, và chỉ gán cho nó privilege [add_servers](privileges.md#add_servers) (bỏ hết các privilege mặc định khác).

Tiếp theo, nhấn "Add Server" từ sidebar, chọn "Docker" làm platform đích, và sao chép lệnh cài đặt vào clipboard. Không nhập bất kỳ tuỳ chọn server nào như label, icon hay group. Nó sẽ trông như thế này:

```sh
docker run --detach --init --restart unless-stopped -v xysat-conf-12345:/etc/xysat -v /var/run/docker.sock:/var/run/docker.sock -e XYSAT_config_file="/etc/xysat/config.json" -e XYOPS_setup="http://YOUR_XYOPS_SERVER:5522/api/app/satellite/config?t=1234567890abcdefghijk" --name "xyops-worker-12345" --hostname "docker-12345" ghcr.io/pixlcore/xysat:latest
```

Lấy biến môi trường `XYOPS_setup` từ lệnh cài đặt, và thay thế auth token tạm thời (hết hạn sau 24 giờ) bằng API Key mới của bạn (không hết hạn). Token là giá trị của query string parameter `t` trong URL. Ví dụ:

```
http://YOUR_XYOPS_SERVER:5522/api/app/satellite/config?t=YOUR_API_KEY_HERE
```

Bây giờ bạn có thể dùng cái này để tạo bao nhiêu Docker worker tuỳ ý. Chỉ cần chỉ định URL mới kèm API Key làm biến môi trường `XYOPS_setup`, và dùng image Docker chính thức `ghcr.io/pixlcore/xysat:latest`.

Đảm bảo bạn dùng named volume mount khác nhau cho thư mục cấu hình của mỗi server (mỗi server cần volume riêng).

Đây là ví dụ dùng Docker Compose:

```yaml
services:
  worker1:
    image: ghcr.io/pixlcore/xysat:latest
    init: true
    restart: unless-stopped
    volumes:
      - xysat-conf-worker1:/etc/xysat
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      XYSAT_config_file: /etc/xysat/config.json
      XYOPS_setup: http://YOUR_XYOPS_SERVER:5522/api/app/satellite/config?t=YOUR_API_KEY_HERE

  worker2:
    image: ghcr.io/pixlcore/xysat:latest
    init: true
    restart: unless-stopped
    volumes:
      - xysat-conf-worker2:/etc/xysat
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      XYSAT_config_file: /etc/xysat/config.json
      XYOPS_setup: http://YOUR_XYOPS_SERVER:5522/api/app/satellite/config?t=YOUR_API_KEY_HERE

  worker3:
    image: ghcr.io/pixlcore/xysat:latest
    init: true
    restart: unless-stopped
    volumes:
      - xysat-conf-worker3:/etc/xysat
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      XYSAT_config_file: /etc/xysat/config.json
      XYOPS_setup: http://YOUR_XYOPS_SERVER:5522/api/app/satellite/config?t=YOUR_API_KEY_HERE
```

Tất cả worker có thể dùng chính xác cùng giá trị `XYOPS_setup` và API Key. Mỗi request tạo ra một Server ID và Auth Token vĩnh viễn duy nhất mới, được lưu trong file cấu hình.

Lưu ý rằng quy trình bootstrap `XYOPS_setup` chỉ cần thiết cho lần khởi chạy đầu tiên của container mới. Nếu file cấu hình đã tồn tại, quy trình setup sẽ tự động được bỏ qua.

## Group và Tự Động Gán

Server có thể thuộc một hoặc nhiều group. Group được dùng để tổ chức fleet, khoanh vùng monitor/alert, và target event.

- **Tự động gán**: Group có thể khai báo một regular expression cho hostname. Khi server kết nối (hoặc khi hostname của nó thay đổi), các group khớp sẽ được áp dụng tự động.
- **Nhiều group**: Server có thể khớp và tham gia nhiều group.
- **Gán thủ công**: Nếu bạn gán group thủ công cho một server, việc khớp tự động theo hostname sẽ bị tắt cho server đó. Bạn có thể bật lại tự động gán bằng cách xoá các group thủ công.
- **Đánh giá lại**: Khớp group được đánh giá lại nếu hostname của server thay đổi.

Xem [Server Groups](groups.md) để biết thêm chi tiết về group server.

## Target Event Vào Server

Event chỉ định target dưới dạng một danh sách chứa server ID và/hoặc group ID. Tại thời điểm chạy, scheduler sẽ phân giải chúng thành tập server đang online, được enable, sau đó chọn một server bằng thuật toán chọn của event (random, round_robin, least_cpu, least_mem, hoặc chính sách dựa trên monitor). Xem [Event.targets](data.md#event-targets) và [Event.algo](data.md#event-algo).

Hành vi khi server offline:

- **Target đơn server**: Nếu server target offline, hành vi có thể cấu hình qua limit: thêm limit Queue để cho phép hàng đợi; nếu không có, job sẽ thất bại ngay lập tức.
- **Target group**: Server offline bị bỏ qua; các server online khác trong group sẽ được chọn thay.

Alert có thể tuỳ chọn ngăn việc khởi chạy job trên một server cụ thể, nên một server đang bị alert có thể bị loại khỏi việc chọn cho đến khi alert đó được clear. Tính năng này được cấu hình ở cấp độ alert (xem [Alerts](alerts.md) để biết thêm chi tiết).

## Max Jobs Per Server

Bạn có thể đặt giới hạn số job đồng thời tối đa *theo từng server*. Ví dụ bạn có thể cấu hình một số server yếu để giới hạn số job chúng có thể chạy đồng thời. Việc này có thể cấu hình trên trang chi tiết server bằng cách nhấn nút "Edit Server", hoặc qua API [update_server](api.md#update_server). Mặc định là không giới hạn.

Khi một server đã đầy và có job mới cần chạy, cách hoạt động là server đó sẽ bị "loại" khỏi việc xem xét khi chọn server từ target của event. Do đó các server thay thế còn "slot" trống sẽ được chọn thay (giả sử target event của bạn có nhiều server hoặc group).

Nếu không có server nào khả dụng do max jobs, hành vi giống như khi server không khả dụng vì lý do khác (ví dụ: server offline, hoặc bị chặn do alert đang active, v.v.). Nếu event có [queuing](limits.md#max-queue-limit) được bật, job sẽ tự động vào hàng đợi cho đến khi có server khả dụng.

Bạn cũng có thể đặt giá trị mặc định cho max jobs per server ở cấp độ group, để không phải sửa từng server riêng lẻ. Để làm điều này, chỉ cần sửa group, bạn sẽ thấy trường mới "Max Jobs Per Server". Nếu một server thuộc nhiều group, group có max jobs per server thấp nhất sẽ được ưu tiên áp dụng.

## Dữ Liệu Người Dùng (User Data)

PTOps có thể lưu dữ liệu tuỳ ý cho mỗi server, gọi là "user data". Đây là một object tự do được lưu dưới dạng JSON, có thể chứa bất kỳ dữ liệu bạn muốn (bao gồm object/array lồng nhau). User data được tự động truyền vào tất cả job đang chạy trên server (xem [Job.serverData](data.md#job-serverdata)), và cũng có thể dùng để target event tuỳ chỉnh.

Bạn có thể thêm hoặc cập nhật server data theo nhiều cách:

- Trong UI, trên trang chi tiết server, nhấn nút "Edit Server".
- Bằng cách gọi API [update_server_data](api.md#update_server_data).
- Trong một job đang chạy (tức là Event Plugin) bằng cách xuất một object `serverData` (xem [Cập Nhật Server Data](plugins.md#server-data)).

Lưu ý toàn bộ server data cho tất cả server đang active được lưu trong memory trên conductor primary, vì vậy nên giữ kích thước hợp lý.

## UI Server

Mỗi server có một trang riêng trong UI PTOps hiển thị trạng thái trực tiếp và lịch sử:

- **Status**: Badge online/offline, label/hostname, IP, OS/arch, chi tiết CPU, memory, virtualization, phiên bản agent, uptime, và group.
- **Metrics nhanh** (mỗi giây): Đồ thị nhỏ cuộn liên tục cho CPU, memory, disk, và network trong 60 giây gần nhất.
- **Monitors** (mỗi phút): Đồ thị cho tất cả monitor và delta do người dùng định nghĩa, có overlay alert.
- **Processes**: Bảng process hiện tại hiển thị PID / parent / CPU / memory / network, và các metrics khác cho từng process.
- **Connections**: Kết nối network hiện tại hiển thị state, IP nguồn và đích, và metrics truyền tải.
- **Running jobs**: Job đang thực thi trực tiếp trên server, bao gồm cả workflow parent/children.
- **Upcoming jobs**: Job dự đoán sẽ chạy trên server này (dựa vào target event và schedule).
- **Alerts**: Alert đang active ảnh hưởng đến server này, kèm link đến lịch sử.
- **User Actions**: Chụp snapshot, đặt watch, sửa chi tiết server (label, enable/disable, icon, group), hoặc xoá server.

Tìm kiếm fleet và lịch sử từ Servers → Search. Bạn có thể filter theo group, OS platform/distro/release/arch, CPU brand/cores, và khoảng thời gian created/modified.

## Snapshots và Watches

Snapshot chụp lại trạng thái hiện tại của server và lưu để kiểm tra và so sánh sau này. Chúng có sẵn ở khu vực Snapshots, và khi được liên kết từ action hoặc alert.

Nội dung một snapshot bao gồm:

- Danh sách process đầy đủ (tương đương ps -ef), kết nối network (bao gồm cả listener), disk mount, network device.
- Thông tin host: loại CPU, số core, RAM tối đa, OS platform/distro/release, uptime, load, v.v.
- 60 giây gần nhất của metrics "quick" (CPU/Mem/Disk/Net theo giây).
- Tham chiếu đến job đang active và alert liên quan tại thời điểm chụp.

Cách tạo snapshot:

- Thủ công: Nhấn "Create Snapshot" trên trang server.
- Actions: Thêm action Snapshot vào một job hoặc alert; hệ thống có thể tự chụp snapshot khi điều kiện thoả.
- Watch: Bắt đầu watch trên một server để chụp snapshot mỗi phút trong một khoảng thời gian (mặc định 5 phút).

Lưu trữ:

- Snapshot được giữ lại tối đa theo một mức trần toàn hệ thống (mặc định 100.000 snap) và được dọn dẹp mỗi đêm.

Xem [Snapshots](snapshots.md) để biết thêm chi tiết.

## Metrics và Sampling

- Mỗi giây ("quick"): CPU, memory, disk, và network; được giữ trong buffer bộ nhớ cuộn 60 giây cho UI.
- Mỗi phút (monitors): Monitor plugin do người dùng định nghĩa chạy mỗi phút trên server để tạo giá trị số (hoặc delta). Chúng cung cấp dữ liệu cho đồ thị, alert, và dashboard. Xem [Monitors](monitors.md).
- Khác biệt OS: Một số metrics không có sẵn trên Windows.

Để tránh hiệu ứng thundering herd trên conductor, mỗi server tự động lệch thời điểm thu thập phút của mình bằng cách dùng hash của Server ID cộng với một offset được tính động. Điều này trải đều việc gửi dữ liệu trên N giây, dựa trên tổng số server trong cluster. Metrics nhanh theo giây cũng làm vậy, nhưng lệch theo milliseconds.

## Lifecycle và Health

- **Online/offline**: Một server online khi WebSocket xySat của nó đang kết nối. Nếu socket bị đứt, server ngay lập tức được đánh dấu offline. UI cập nhật theo thời gian thực.
- **Running jobs**: Job không bị abort ngay khi server offline. Thay vào đó, conductor chờ `dead_job_timeout` trước khi tuyên bố job đã chết và abort nó (mặc định: 120 giây). Xem [Configuration](config.md#dead_job_timeout).
- **Enable/disable**: Disable một server sẽ loại nó khỏi việc chọn job nhưng nó vẫn có thể online và tiếp tục báo cáo metrics.

## Khả Năng Mở Rộng

PTOps được thiết kế cho các fleet lớn và đã được test lên đến hàng trăm server mỗi cluster. Đối với cluster lớn hơn:

- Việc lệch thời điểm tự động đảm bảo không phải tất cả server gửi mẫu phút và giây cùng lúc; tải được trải đều trên một khoảng thời gian động.
- Conductor nên chạy trên phần cứng mạnh (CPU/RAM/SSD) để đạt hiệu năng tốt nhất khi thu nạp và tổng hợp dữ liệu, chạy bầu chọn, và phục vụ UI/API.
- Bạn có thể vận hành nhiều conductor (primary + hot standby peer). Agent tự động failover giữa chúng; cluster thực hiện bầu chọn để chọn primary mới khi cần.

Xem thêm hướng dẫn [Scaling](scaling.md).

## Ngừng Sử Dụng Server

Để loại bỏ một server, mở trang chi tiết của nó và nhấn icon thùng rác:

- **Online**: Conductor gửi lệnh gỡ cài đặt đến agent, agent sẽ tắt và gỡ xySat. Bạn cũng có thể tuỳ chọn xoá dữ liệu lịch sử (bản ghi server, metrics, snapshots).
- **Offline**: Bạn vẫn có thể xoá server nhưng phải chọn xoá lịch sử, vì gỡ cài đặt yêu cầu kết nối đang active.

Việc xoá là vĩnh viễn và không thể hoàn tác.

## Dữ Liệu và API Liên Quan

- Data: [Server](data.md#server), [ServerMonitorData](data.md#servermonitordata), [Snapshot](data.md#snapshot), [Group](data.md#group).
- Servers API: [get_active_servers](api.md#get_active_servers), [get_active_server](api.md#get_active_server), [get_server](api.md#get_server), [update_server](api.md#update_server), [delete_server](api.md#delete_server), [watch_server](api.md#watch_server), [create_snapshot](api.md#create_snapshot).
- Search: [search_servers](api.md#search_servers), tóm tắt server, và search snapshots.
