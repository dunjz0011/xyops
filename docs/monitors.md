# Monitors

## Tổng Quan

Monitor theo dõi một số liệu (metric) duy nhất của server theo thời gian. Mỗi monitor trỏ đến một giá trị trong dữ liệu server thời gian thực (live), ép kiểu dữ liệu (integer, float, bytes, seconds, hoặc milliseconds), và PTOps lưu các mẫu (sample) vào cơ sở dữ liệu chuỗi thời gian (time-series). Monitor cung cấp dữ liệu cho các biểu đồ theo từng server và từng group, và có thể được dùng để kích hoạt alert.

- Một monitor đánh giá expression của nó một lần mỗi phút trên mỗi server khớp.
- Kết quả được lưu và vẽ biểu đồ ở nhiều độ phân giải (theo giờ, ngày, tháng, năm).
- Alert có thể tham chiếu giá trị monitor và delta tính toán của chúng khi cần.
- PTOps đi kèm sẵn một số monitor mặc định, và bạn có thể tự định nghĩa thêm.

Xem thêm:

- Mô hình dữ liệu: [Monitor](data.md#monitor) và [ServerMonitorData](data.md#servermonitordata)
- Plugin: [Monitor Plugin](plugins.md#monitor-plugins)
- Alert: [Alerts](alerts.md)

## Cách Hoạt Động

Mỗi phút, mỗi satellite gửi một snapshot [ServerMonitorData](data.md#servermonitordata) mới nhất đến conductor chính. Với mỗi monitor mà phạm vi group của nó khớp với server:

1. PTOps đánh giá source expression của monitor dựa trên mẫu dữ liệu monitor hiện tại của server.
2. Giá trị được ép kiểu dùng data type của monitor và regex khớp (match) tuỳ chọn.
3. Nếu monitor được cấu hình là delta monitor, tốc độ (rate) của nó được tính từ giá trị tuyệt đối trước đó (và tuỳ chọn chia cho số giây đã trôi qua).
4. Giá trị được chèn vào chuỗi thời gian của server ở tất cả các độ phân giải.

Lưu ý:

- Expression của monitor chỉ chạy trên context dữ liệu ServerMonitorData thời gian thực. Chúng không phụ thuộc vào các monitor khác.
- Alert được đánh giá ngay sau khi monitor được tính toán, và có thể tham chiếu cả giá trị monitor tuyệt đối và delta đã tính.
- Phạm vi theo group cho phép một monitor chỉ chạy trên các group server cụ thể. Để trống group để áp dụng cho tất cả.

## Tạo và Chỉnh Sửa Monitor

Vào Admin → Monitors.

- **Title**: Tên hiển thị cho biểu đồ.
- **Display**: Bật/tắt hiển thị biểu đồ trên UI mà không cần xoá monitor.
- **Icon**: Material Design Icon tuỳ chọn hiển thị cạnh title.
- **Server Groups**: Giới hạn đánh giá cho các group cụ thể (tuỳ chọn).
- **Data Expression**: Một expression trích xuất hoặc tính toán một giá trị số duy nhất từ ServerMonitorData. Xem [Expression](#expressions).
- **Data Match**: Regular expression tuỳ chọn để trích xuất một số từ một giá trị dạng string. Xem [Data Match](#data-match).
- **Data Type**: Kiểm soát cách parse và hiển thị (integer, float, bytes, seconds, milliseconds).
- **Delta Features**: Với các nguồn dạng counter, tính delta và tuỳ chọn chia cho thời gian trôi qua để có tốc độ mỗi giây; cũng hỗ trợ giới hạn tối thiểu bằng 0 (zero-minimum clamp).
- **Min Vert Range**: Đặt phạm vi trục Y tối thiểu (ví dụ 100 cho phần trăm).
- **Data Suffix**: Đơn vị tuỳ chọn hiển thị trong label (ví dụ %, /sec, ms).

Mẹo:

- Dùng nút "Test..." để đánh giá expression của bạn trên một server thời gian thực trước khi lưu.
- Nhấn icon tìm kiếm để mở Server Data Explorer và khám phá các path ServerMonitorData thời gian thực.
- Bạn có thể import/export monitor dưới dạng JSON (xem các ví dụ mặc định dưới đây).

## Luồng Dữ Liệu Monitoring

- **Tần suất lấy mẫu**: Mỗi phút một lần trên mỗi server.
- **Lưu trữ**: Các mẫu được giảm mẫu (down-sample) vào bốn hệ thống: giờ, ngày, tháng, năm.
- **Delta**: Với các metric dạng counter (ví dụ tổng byte network OS, counter byte đọc/viết đĩa), bật "Calc as Delta" và "Divide by Time" để vẽ biểu đồ tốc độ mỗi giây.
- **Context alert**: Sau khi monitor được tính toán, PTOps đánh giá trigger alert dựa trên cùng dữ liệu đó.

## Expression

Expression của monitor được đánh giá theo [Cú Pháp Expression PTOps](xyexp.md), dùng object [ServerMonitorData](data.md#servermonitordata) hiện tại làm context. Cú pháp này giống JavaScript với dot path, chỉ mục array, toán tử số học và boolean.

Ví dụ:

- Metric cơ bản: `cpu.currentLoad` (mức sử dụng CPU dạng phần trăm float)
- Chỉ mục array: `load[0]` (load average trung bình 1 phút)
- Object path: `stats.network.conns` (số kết nối đang hoạt động)
- Toán học/kết hợp: `100 - memory.available / memory.total * 100` (% memory đã dùng)
- Toán học có bảo vệ: `stats && stats.network ? stats.network.rx_bytes : 0` (gộp giá trị thiếu thành 0)

Hướng dẫn:

- Expression phải trả về một giá trị số duy nhất trước khi ép kiểu cuối cùng.
- Context đánh giá là [ServerMonitorData](data.md#servermonitordata) của phút hiện tại. Không tham chiếu `monitors.*` hoặc `deltas.*` trong expression của monitor.
- Với các metric phức tạp hoặc tuỳ chỉnh, xem xét dùng một [Monitor Plugin](plugins.md#monitor-plugins) có thể xuất dữ liệu vào `commands`, và trích xuất một số qua expression (và tuỳ chọn `data_match`).

## Data Match

Nếu expression của bạn trả về một string và số nằm trong đó, đặt `Data Match` thành một regular expression để trích xuất chính xác một giá trị số. Nếu regex có capture group, group đầu tiên được dùng; nếu không, toàn bộ phần khớp được dùng.

Ví dụ (monitor "Open Files" mặc định):

- Expression: `commands.open_files`
- Data Match: `(\d+)`
- Kết quả: Trích xuất số nguyên đầu tiên từ một string như `"1056\t0\t9223372036854775807"`.

## Delta Monitors

Một số nguồn dữ liệu là counter tuyệt đối chỉ tăng dần, ví dụ tổng byte network OS hoặc counter byte I/O đĩa. Với các trường hợp này:

- **Calc as Delta**: Lưu thay đổi so với phút trước đó thay vì counter tuyệt đối.
- **Divide by Time**: Chia delta cho số giây trôi qua giữa các mẫu để tạo tốc độ mỗi giây.
- **Zero Minimum**: Giới hạn (clamp) các đợt giảm âm về một mức tối thiểu cụ thể (thường là `0`) để tránh sụt giảm sau khi reboot hoặc reset counter.

Alert cũng có thể tham chiếu giá trị delta qua object `deltas`. Xem [Alert Expressions](alerts.md#alert-expressions).

## Monitor Mặc Định

PTOps đi kèm sẵn một tập monitor chuẩn. Đây là những gì mỗi monitor theo dõi:

- **Load Average**: `load[0]` -- load average trung bình 1 phút (float).
- **CPU Usage**: `cpu.currentLoad` -- phần trăm sử dụng CPU (float), suffix `%`, min range `100`.
- **Memory in Use**: `memory.used` -- Tổng memory đang dùng (bytes).
- **Memory Available**: `memory.available` -- Memory khả dụng (bytes).
- **Network Connections**: `stats.network.conns` -- Số kết nối socket đang hoạt động (integer).
- **Disk Usage**: `mounts.root.use` -- Phần trăm sử dụng filesystem root (float), suffix `%`, min range `100`.
- **Disk Read**: `stats.fs.rx` -- Byte đĩa đã đọc, dạng delta chia theo thời gian (bytes/sec). Bật: Calc as Delta, Divide by Time, Zero Minimum.
- **Disk Write**: `stats.fs.wx` -- Byte đĩa đã viết, dạng delta chia theo thời gian (bytes/sec). Bật: Calc as Delta, Divide by Time, Zero Minimum.
- **Disk I/O**: `stats.io.tIO` -- Tổng số lệnh I/O đĩa mỗi giây (integer). Bật: Calc as Delta, Divide by Time, Zero Minimum.
- **I/O Wait**: `cpu.totals.iowait` -- Phần trăm CPU chờ I/O (float, chỉ Linux), suffix `%`, min range `100`.
- **Open Files**: `commands.open_files` với `Data Match` `(\d+)` -- Số file đang mở (integer, chỉ Linux).
- **Network In**: `stats.network.rx_bytes` -- Byte network vào mỗi giây (bytes/sec). Bật: Calc as Delta, Divide by Time, Zero Minimum.
- **Network Out**: `stats.network.tx_bytes` -- Byte network ra mỗi giây (bytes/sec). Bật: Calc as Delta, Divide by Time, Zero Minimum.
- **Processes**: `processes.all` -- Tổng số process (integer).
- **Active Jobs**: `jobs` -- Số job PTOps đang hoạt động trên server (integer).

Dùng các monitor này làm mẫu cho monitor riêng của bạn, hoặc tạo mới từ đầu. Bạn cũng có thể import/export monitor dưới dạng file JSON.

## Ví Dụ và Mẫu Áp Dụng

- **Theo Dõi Memory Của Process Cụ Thể**
  - Expression: `processes.list[.command == 'ffmpeg'].memRss` *(khớp tên chính xác)*
  - Expression: `find( processes.list, 'command', 'ffmpeg' ).memRss` *(khớp chuỗi con)*
  - Type: `bytes`
- **% Memory Đã Dùng**
  - Expression: `100 - memory.available / memory.total * 100`
  - Type: `float`, Suffix: `%`, Min Vert Range: `100`.
- **Dung Lượng Trống Root (đơn vị GB)**
  - Expression: `(mounts.root.available) / (1024 * 1024 * 1024)`
  - Type: `float`, Suffix: `GB`.
- **Socket TCP LISTEN**
  - Expression: `count( conns[.state == 'LISTEN'] )`
  - Hoặc thay thế: `stats.network.states.listen`
  - Type: `integer`.

Nếu expression của bạn trả về string (ví dụ output của lệnh tuỳ chỉnh), dùng "Data Match" để trích xuất số. Với metric nâng cao, viết một [Monitor Plugin](plugins.md#monitor-plugins) xuất dữ liệu có cấu trúc, rồi trỏ expression monitor vào đó.

## QuickMon

QuickMon (Quick Monitors) là các monitor thời gian thực nhẹ, được định nghĩa sẵn, lấy mẫu mỗi giây trên mỗi server. Chúng dùng để hiển thị ngay lập tức và biểu đồ xu hướng ngắn hạn trên trang server và group.

- **Preset**: Load/sử dụng CPU, memory đã dùng/khả dụng, byte đọc/viết đĩa mỗi giây, byte network vào/ra mỗi giây.
- **Lưu trữ**: 60 giây gần nhất của mỗi server được lưu trong memory.
- **Hiển thị**: Biểu đồ và gauge thời gian thực trên trang Server và Group. Mẫu mới được truyền trực tiếp (stream) qua websocket.
- **Snapshot**: Chuỗi 60 giây gần nhất được nhúng vào tất cả snapshot server và group.
- **Cấu hình**: Định nghĩa nằm trong `config.json` dưới [quick_monitors](config.md#quick_monitors). Mỗi preset gồm `id`, path `source` (từ dữ liệu agent mỗi giây), `type` (integer/float/bytes), và tuỳ chọn delta/thời gian tương tự hành vi monitor.
- **Platform**: Hỗ trợ trên Linux và macOS.

QuickMon bổ trợ cho monitor cấp phút: dùng QuickMon để hiển thị ngay lập tức, và monitor chuẩn để phân tích lịch sử và cảnh báo.

### Biểu Đồ QuickMon Tuỳ Chỉnh

Bạn có thể mở rộng hệ thống QuickMon bằng cách thêm biểu đồ tuỳ chỉnh riêng. Việc này được thực hiện bằng cách chỉnh sửa array [quick_monitors](config.md#quick_monitors) trong cấu hình PTOps của bạn, và thêm các item riêng. Đây là ví dụ một biểu đồ tuỳ chỉnh:

```json
{ "id": "_qm_mem_free", "title": "Memory Free", "source": "mem.free", "type": "bytes", "suffix": "" },
```

Mỗi định nghĩa quick monitor nên bao gồm các thuộc tính sau:

| Tên Thuộc Tính | Kiểu | Mô Tả |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID duy nhất cho quick monitor. Xem quy tắc đặc biệt dưới đây. |
| `title` | String | **(Bắt buộc)** Tiêu đề hiển thị cho monitor, hiện ở đầu biểu đồ. |
| `source` | String | **(Bắt buộc)** Nguồn dữ liệu cho monitor, ở dạng [XYEXP](xyexp.md). Xem dưới đây. |
| `type` | String | **(Bắt buộc)** Kiểu dữ liệu, nên là một trong: `integer`, `float`, `bytes`, `seconds`, hoặc `milliseconds`. |
| `suffix` | String | Suffix tuỳ chọn hiển thị sau giá trị dữ liệu. |
| `data_match` | String | Regular expression tuỳ chọn để trích xuất một giá trị số từ một thuộc tính dạng string. |
| `groups` | Array | Danh sách [Group.id](data.md#group-id) tuỳ chọn để giới hạn nơi hiển thị quick monitor. |

Với thuộc tính `id`, vui lòng chỉ dùng chữ thường alphanumeric và underscore, và đảm bảo nó **không** trùng với bất kỳ [Monitor.id](data.md#monitor-id) hoặc [Alert.id](data.md#alert-id) nào có sẵn. Quy ước phổ biến là đặt tiền tố ID bằng `_qm_`.

Dữ liệu QuickMon có thể truy cập qua thuộc tính `source` bị giới hạn, vì nó được cập nhật mỗi giây, và chúng ta muốn dùng ít tài nguyên hệ thống nhất có thể. Đây là ví dụ một đợt dữ liệu QuickMon, và các thuộc tính thường có sẵn. Lưu ý các thuộc tính này khác nhau giữa kiến trúc server, platform, và OS.

```json
{
	"mem": {
		"total": 950247424,
		"free": 224559104,
		"used": 269819904,
		"available": 680427520,
		"buffers": 91369472,
		"cached": 374026240,
		"swapcached": 19697664,
		"active": 295432192,
		"inactive": 279474176,
		"unevictable": 16384,
		"mlocked": 16384,
		"swaptotal": 536866816,
		"swapfree": 335609856,
		"zswap": 0,
		"zswapped": 0,
		"dirty": 20480,
		"writeback": 0,
		"anonpages": 107511808,
		"mapped": 146522112,
		"shmem": 2834432,
		"kreclaimable": 60678144,
		"slab": 94081024,
		"sreclaimable": 60678144,
		"sunreclaim": 33402880,
		"kernelstack": 5189632,
		"pagetables": 8871936,
		"secpagetables": 0,
		"nfs_unstable": 0,
		"bounce": 0,
		"writebacktmp": 0,
		"commitlimit": 1011990528,
		"committed_as": 1827897344,
		"vmalloctotal": 267353325568,
		"vmallocused": 15085568,
		"vmallocchunk": 0,
		"percpu": 786432,
		"cmatotal": 268435456,
		"cmafree": 168939520
	},
	"net": {
		"rx": 10382830154,
		"tx": 2513760237
	},
	"cpu": {
		"avgLoad": 0,
		"currentLoad": 0,
		"cpus": [
			{
				"user": 0,
				"nice": 0,
				"system": 0,
				"idle": 100,
				"iowait": 0,
				"irq": 0,
				"softirq": 0,
				"active": 0
			},
			{
				"user": 0,
				"nice": 0,
				"system": 0,
				"idle": 100,
				"iowait": 0,
				"irq": 0,
				"softirq": 0,
				"active": 0
			},
			{
				"user": 0,
				"nice": 0,
				"system": 0,
				"idle": 100,
				"iowait": 0,
				"irq": 0,
				"softirq": 0,
				"active": 0
			},
			{
				"user": 0,
				"nice": 0,
				"system": 0,
				"idle": 100,
				"iowait": 0,
				"irq": 0,
				"softirq": 0,
				"active": 0
			}
		],
		"totals": {
			"user": 0,
			"nice": 0,
			"system": 0,
			"idle": 100,
			"iowait": 0,
			"irq": 0,
			"softirq": 0,
			"active": 0
		}
	},
	"fs": {
		"rx": 2525403648,
		"wx": 13779088384
	},
	"commands": {
		/* Xem phần tiếp theo... */
	}
}
```

- Các thuộc tính `mem` lấy từ `/proc/meminfo` trên Linux và `vm_stat` trên macOS.
- Các thuộc tính `net` lấy từ `/proc/net/dev` trên Linux và `netstat` trên macOS.
- Các thuộc tính `cpu` lấy từ `/proc/stat` trên Linux và [os.cpus()](https://nodejs.org/api/os.html#oscpus) trên macOS.
- Các thuộc tính `fs` lấy từ `/proc/diskstats` trên Linux và `ioreg` trên macOS.
- Các thuộc tính `command` được giải thích trong phần kế tiếp.

Lưu ý quick monitor không được hỗ trợ trên server Windows.

### Monitor Plugin QuickMon Tuỳ Chỉnh

> [!WARNING]
> Đây là tính năng nâng cao. Vui lòng đọc kỹ tài liệu, và tự chịu rủi ro khi sử dụng. Ngoài ra, tính năng này yêu cầu PTOps v1.0.47+ và xySat v1.0.18+.

Bất kỳ [Monitor Plugin](plugins.md#monitor-plugins) nào cũng có thể được đưa vào phần capture dữ liệu QuickMon mỗi giây chạy trên tất cả server. Tất cả những gì bạn cần làm là tick vào checkbox "**Include in Quick Monitors**" khi tạo hoặc chỉnh sửa Monitor Plugin của bạn. Nhưng **vui lòng hiểu** điều này nghĩa là plugin của bạn sẽ được thực thi **mỗi giây** trên tất cả server mà nó nhắm đến. Vậy nên nó cần thực thi và kết thúc *cực kỳ* nhanh, tốt nhất là 50ms hoặc ít hơn. Chậm hơn mức đó thì biểu đồ QuickMon có thể không render hoặc animate đúng cách. Thời gian thực thi tối đa là 1000ms, sau đó process Plugin sẽ bị hủy.

Vì lý do này, thường tốt nhất là chỉ lấy nội dung của một file, thay vì chạy một lệnh nặng. Đây là ví dụ:

- **Executable**: `/bin/sh`
- **Script**: `cat /sys/class/thermal/thermal_zone0/temp`

Trong trường hợp này Plugin chỉ in nội dung của file `/sys/class/thermal/thermal_zone0/temp`, mà thường chứa nhiệt độ CPU hiện tại theo millidegree Celsius trên Linux. Output của Monitor Plugin của bạn được đặt vào object `commands` trong dữ liệu QuickMon. Chúng ta có thể dùng giá trị này trong một [Biểu Đồ QuickMon Tuỳ Chỉnh](#custom-quickmon-graphs) như sau:

```json
{ 
	"id": "_qm_cpu_temperature", 
	"title": "CPU Temperature", 
	"source": "integer(commands.MY_PLUGIN_ID) / 1000", 
	"type": "integer", 
	"suffix": "C"
}
```

Một vài lưu ý:

- Chúng ta đặt tiền tố ID bằng `_qm_` để đảm bảo nó không bao giờ trùng với bất kỳ [Monitor.id](data.md#monitor-id) hoặc [Alert.id](data.md#alert-id) nào.
- Thay `MY_PLUGIN_ID` bằng [Plugin.id](data.md#plugin-id) của Monitor Plugin của bạn.
- `source` ở dạng [XYEXP](xyexp.md), vậy nên chúng ta có thể dùng các hàm hỗ trợ như `integer()` và cũng chia giá trị cho 1000 để có celsius.
- Biểu đồ QuickMon được render theo thứ tự chúng xuất hiện trong array [quick_monitors](config.md#quick_monitors).
- Sau khi lưu file cấu hình PTOps, vui lòng đợi vài giây, rồi refresh web UI để các thay đổi biểu đồ có hiệu lực.
