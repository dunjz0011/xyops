# Giao Diện Người Dùng

## Tổng Quan

Tài liệu này giải thích các cài đặt giao diện người dùng chính trong PTOps, nằm trong object `client` trong file cấu hình của bạn.

File cấu hình chính thường nằm ở `/opt/xyops/conf/config.json`. Nếu bạn chỉnh sửa cài đặt trong Admin UI, PTOps sẽ ghi thay đổi vào `/opt/xyops/conf/overrides.json`. Xem [Configuration](config.md) và [Self-Hosting](hosting.md#configuration) để biết thêm chi tiết.

## Whitelabel

PTOps có thể được whitelabel nhẹ bằng cách đổi tên sản phẩm, tên công ty ở footer, và logo. Các cài đặt này ảnh hưởng đến giao diện web, tiêu đề email, footer email, và các thông báo hiển thị cho người dùng khác.

| Cài Đặt | Mặc Định | Mô Tả |
|---------|---------|-------------|
| `client.name` | `PTOps` | Tên ứng dụng hiển thị trong UI, text đăng nhập, tiêu đề tài liệu, tiêu đề email, text alert, text web hook, và chuỗi phiên bản. |
| `client.company` | `PixlCore LLC` | Tên công ty hiển thị ở footer UI và copyright footer email. |
| `client.logo_url` | `/images/logotype.png` | Đường dẫn hoặc URL ảnh logo dùng trong sidebar, header đăng nhập, và template email. |

Ví dụ:

```json
{
	"client": {
		"name": "Acme Ops",
		"company": "Acme Corp",
		"logo_url": "/images/acme-ops-logo.png"
	}
}
```

`logo_url` có thể là đường dẫn web root cục bộ, thường bắt đầu bằng `/`, hoặc một URL ảnh đầy đủ. Tuy nhiên, chế độ mặc định của `email_logo` là `inline`, sẽ nhúng logo vào email gửi đi. Ở chế độ đó, `logo_url` phải là đường dẫn cục bộ dưới thư mục `htdocs` của PTOps, vì PTOps đọc ảnh từ đĩa trước khi đính kèm vào email. Nếu bạn đặt [email_logo](config.md#email_logo) thành `link`, thì `logo_url` có thể là URL ảnh từ xa.

Bạn cũng có thể override các cài đặt này bằng biến môi trường:

```sh
XYOPS_client__name="Acme Ops"
XYOPS_client__company="Acme Corp"
XYOPS_client__logo_url="/images/acme-ops-logo.png"
```

## Sidebar

Sidebar có thể được kiểm soát ở ba cấp độ:

1. **Tuỳ chọn người dùng trong UI:** Mỗi người dùng có thể chọn phần sidebar nào hiển thị từ **My Settings**. Được lưu trong bản ghi user dưới dạng `sidebar`.
2. **Tuỳ chọn mặc định cho người dùng mới:** Mảng `default_user_prefs.sidebar` phía server đặt các phần sidebar mặc định cho người dùng mới, và cho người dùng được tạo qua SSO khi hồ sơ của họ được khởi tạo.
3. **Phần ẩn toàn cục:** Mảng `client.hide_sidebar_sections` ép ẩn các phần cho tất cả mọi người, bất kể tuỳ chọn cá nhân của họ.

Đây là toàn bộ ID phần sidebar có sẵn:

```json
[
	"main",
	"job_searches",
	"ticket_searches",
	"shortcuts",
	"scheduler",
	"monitoring",
	"settings",
	"admin",
	"help"
]
```

### Tuỳ Chọn Sidebar Của Người Dùng

Người dùng có thể mở **My Settings** và chọn các phần sidebar mà họ muốn thấy. Điều này chỉ ảnh hưởng đến tài khoản của họ, và không thay đổi quyền hạn. Ví dụ, ẩn phần sidebar **Admin** làm UI gọn hơn cho người dùng đó, nhưng không loại bỏ quyền admin.

Bên trong, lựa chọn này được lưu trong bản ghi user dưới dạng [User.sidebar](data.md#user-sidebar).

Một số tab riêng lẻ vẫn tự động bị ẩn dựa trên quyền hạn. Ví dụ, người dùng không phải admin sẽ không thấy hầu hết các liên kết Admin, dù mảng `sidebar` của họ có chứa `admin`.

### Tuỳ Chọn Sidebar Mặc Định

Để đặt bố cục sidebar khởi đầu cho người dùng mới, thêm mảng `sidebar` vào trong [default_user_prefs](config.md#default_user_prefs).

Người dùng vẫn có thể tự tuỳ chỉnh sau trong **My Settings**, trừ khi bạn cũng ẩn các phần toàn cục bằng `client.hide_sidebar_sections`.

### Ẩn Phần Sidebar Toàn Cục

Để ẩn các phần sidebar cho tất cả người dùng, thêm ID của chúng vào `client.hide_sidebar_sections`:

```json
{
	"client": {
		"hide_sidebar_sections": ["ticket_searches", "shortcuts", "help"]
	}
}
```

Các phần bị ẩn toàn cục cũng bị loại khỏi bộ chọn sidebar trong **My Settings**, nên người dùng không thể tự bật lại.

Điều này hữu ích khi bạn muốn đơn giản hoá UI cho một triển khai tập trung vào một mục đích cụ thể. Ví dụ, nếu bạn chỉ dùng PTOps cho giám sát và alert, bạn có thể muốn ẩn các phần liên quan đến scheduler khỏi hầu hết các cài đặt.

## Bảng Có Thể Sắp Xếp (Sortable Tables)

PTOps có nhiều bảng có thể sắp xếp trong UI. Khi người dùng nhấn vào tiêu đề cột bảng, PTOps sẽ ghi nhớ cột và hướng sắp xếp đã chọn trong tuỳ chọn trình duyệt cục bộ của người dùng đó.

Object `client.tables` cho phép bạn định nghĩa cài đặt sắp xếp mặc định toàn cục cho các bảng này:

```json
{
	"client": {
		"tables": {
			"t_servers": {
				"sort_by": "num_alerts",
				"sort_dir": -1
			},
			"t_events": {
				"sort_by": "title",
				"sort_dir": 1
			}
		}
	}
}
```

Thứ tự ưu tiên là:

1. Tuỳ chọn trình duyệt đã ghi nhớ của người dùng, nếu có.
2. Mặc định toàn cục trong `client.tables`.
3. Mặc định có sẵn từ code của trang.

Điều này nghĩa là `client.tables` phù hợp nhất cho mặc định lần chạy đầu tiên, màn hình kiosk chia sẻ, hoặc reset thứ tự sắp xếp khởi đầu cho người dùng chưa tự chọn cách sắp xếp bảng của họ.

### Hướng Sắp Xếp

Dùng `1` cho thứ tự tăng và `-1` cho thứ tự giảm:

```json
{
	"sort_by": "title",
	"sort_dir": 1
}
```

### ID Bảng

Đây là các ID bảng có thể sắp xếp có sẵn và cài đặt sắp xếp mặc định của chúng:

| Table ID | Trang | Mặc Định Có Sẵn |
|----------|------|------------------|
| `t_events` | Events và Workflows | `cat_sort`, tăng |
| `t_servers` | Active Servers | `label`, tăng |
| `t_plugins` | Plugins | `title`, tăng |
| `t_marketplace` | Marketplace | `title`, tăng |
| `t_snap_conts` | Server Snapshot Containers | `cpu`, giảm |
| `t_snap_procs` | Server Snapshot Processes | `cpu`, giảm |
| `t_snap_conns` | Server Snapshot Connections | `state`, tăng |
| `t_snap_ifaces` | Server Snapshot Interfaces | `iface`, tăng |
| `t_snap_fs` | Server Snapshot Mounts | `mount`, tăng |
| `t_grp_conts` | Group Containers | `cpu`, giảm |
| `t_grp_procs` | Group Processes | `cpu`, giảm |
| `t_grp_conns` | Group Connections | `state`, tăng |

### ID Cột

Giá trị `sort_by` phải khớp với một trong các ID cột của bảng. Ví dụ phổ biến bao gồm:

```json
{
	"client": {
		"tables": {
			"t_servers": { "sort_by": "num_jobs", "sort_dir": -1 },
			"t_plugins": { "sort_by": "created", "sort_dir": -1 },
			"t_snap_procs": { "sort_by": "memRss", "sort_dir": -1 },
			"t_snap_fs": { "sort_by": "use", "sort_dir": -1 }
		}
	}
}
```

Nếu bạn dùng một ID cột không tồn tại cho bảng đó, tiêu đề bảng sẽ không thể mô tả rõ cách sắp xếp, và việc sắp xếp có thể không hoạt động như mong đợi. Nếu không chắc, hãy dùng các mặc định có sẵn ở trên.

Đây là các ID cột có thể sắp xếp cho từng bảng:

| Table ID | ID Cột Có Thể Sắp Xếp |
|----------|---------------------|
| `t_events` | `title`, `cat_sort`, `tag_sort`, `plug_sort`, `target_sort`, `timing_sort`, `status_sort` |
| `t_servers` | `label`, `ip`, `grp_labels`, `cpu_cores`, `mem_total`, `arch_label`, `os_label`, `sat_ver`, `uptime`, `num_jobs`, `num_alerts` |
| `t_plugins` | `title`, `id`, `type`, `source_sort`, `created` |
| `t_marketplace` | `title`, `author`, `license`, `type`, `modified_sort`, `status_sort` |
| `t_snap_conts` | `name`, `id`, `cpu`, `mem_usage`, `mem_total`, `net_read`, `net_write`, `disk_read`, `disk_write` |
| `t_snap_procs` | `command`, `user`, `pid`, `parentPid`, `cpu`, `memRss`, `age`, `state` |
| `t_snap_conns` | `state`, `type`, `local_addr`, `remote_addr`, `command`, `bytes_in`, `bytes_out` |
| `t_snap_ifaces` | `iface`, `ip4`, `ip6`, `operstate`, `type`, `speed`, `rx_sec`, `tx_sec` |
| `t_snap_fs` | `mount`, `type`, `fs`, `size`, `used`, `avail`, `use` |
| `t_grp_conts` | `name`, `id`, `server_label`, `cpu`, `mem_usage`, `mem_total`, `net_read`, `net_write`, `disk_read`, `disk_write` |
| `t_grp_procs` | `command`, `server_label`, `user`, `pid`, `parentPid`, `cpu`, `memRss`, `age`, `state` |
| `t_grp_conns` | `state`, `server_label`, `type`, `local_addr`, `remote_addr`, `command`, `bytes_in`, `bytes_out` |

## Cài Đặt UI Chung

| Cài Đặt | Mặc Định | Mô Tả |
|---------|---------|-------------|
| `client.items_per_page` | `50` | Kích thước trang mặc định cho kết quả tìm kiếm và các trang danh sách chính, như job search, tickets, servers, alerts, marketplace, activity, và snapshots. |
| `client.alt_items_per_page` | `25` | Kích thước trang phụ cho danh sách inline gọn, dialog chọn, tra cứu job gần đây, upcoming jobs, và các widget UI nhỏ khác. |
| `client.max_table_rows` | `500` | Số dòng tối đa render trong các bảng sắp xếp phía client trước khi UI cắt ngắn hiển thị với dòng "more not shown". |
| `client.max_menu_items` | `1000` | Số tuỳ chọn tối đa hiển thị trong menu chọn và dropdown. |
| `client.max_job_output` | `5 MB` | Lượng output job tối đa hiển thị inline trên trang Job Details. |
| `client.alt_to_toggle` | `false` | Yêu cầu người dùng giữ Opt/Alt khi toggle cờ enabled trong một số màn hình danh sách admin đã chọn, giúp tránh nhấn nhầm. |

Ví dụ:

```json
{
	"client": {
		"items_per_page": 100,
		"alt_items_per_page": 50,
		"max_table_rows": 1000,
		"max_menu_items": 2000,
		"max_job_output": "10 MB",
		"alt_to_toggle": true
	}
}
```

## Mẫu Event Mới (New Event Template)

Object `client.new_event_template` cung cấp giá trị mặc định cho các event và workflow mới được tạo. Nó được sao chép vào form event khi người dùng bắt đầu tạo một event mới.

Mẫu mặc định bao gồm:

```json
{
	"id": "",
	"title": "",
	"enabled": true,
	"targets": [],
	"params": {},
	"fields": [],
	"triggers": [
		{
			"enabled": true,
			"type": "manual"
		}
	],
	"limits": [
		{
			"type": "job",
			"enabled": true,
			"amount": 1
		},
		{
			"type": "queue",
			"enabled": true,
			"amount": 0
		},
		{
			"type": "retry",
			"enabled": true,
			"amount": 0,
			"duration": 0
		}
	],
	"actions": [],
	"notes": ""
}
```

Bạn có thể dùng cái này để đặt mặc định khớp với tổ chức của bạn, như category mặc định, plugin, target group, action, tag, limit, hoặc notes. Xem [Events](events.md), [Limits](limits.md), và [Actions](actions.md) cho các trường event.

Ví dụ:

```json
{
	"client": {
		"new_event_template": {
			"enabled": true,
			"category": "general",
			"targets": ["all_servers"],
			"algo": "random",
			"triggers": [
				{
					"enabled": true,
					"type": "manual"
				}
			],
			"limits": [
				{
					"type": "job",
					"enabled": true,
					"amount": 1
				},
				{
					"type": "queue",
					"enabled": true,
					"amount": 0
				}
			],
			"actions": [],
			"tags": ["ops"],
			"notes": ""
		}
	}
}
```

## Mặc Định Chart

Object `client.chart_defaults` được truyền vào bộ render chart UI dùng cho biểu đồ monitor và số liệu server. Nó kiểm soát các chi tiết trực quan như độ rộng đường, làm mịn, số lượng tick, độ mờ fill, và hành vi sắp xếp khi hover.

Mặc định:

```json
{
	"lineWidth": 2,
	"lineJoin": "round",
	"lineCap": "butt",
	"stroke": true,
	"fill": 0.5,
	"horizTicks": 6,
	"vertTicks": 6,
	"smoothingMaxSamples": 100,
	"smoothingMaxTotalSamples": 1000,
	"hoverSort": -1
}
```

Các tuỳ chọn này được merge với mặc định UI của PTOps trước khi mỗi chart được render. Xem [pixl-chart](https://github.com/jhuckaby/pixl-chart) để biết hành vi tuỳ chọn chart ở mức thấp hơn.

## Mặc Định Code Editor

Object `client.editor_defaults` cấu hình các trường CodeMirror trong UI, như script editor, JSON editor, và text area hỗ trợ định dạng code.

Mặc định:

```json
{
	"lineNumbers": false,
	"matchBrackets": false,
	"indentWithTabs": true,
	"tabSize": 4,
	"indentUnit": 4,
	"lineWrapping": true,
	"dragDrop": false
}
```

Các giá trị này được truyền vào CodeMirror khi editor được tạo. Xem [CodeMirror 5](https://codemirror.net/5/) để biết các tuỳ chọn editor được hỗ trợ.

## Cài Đặt Upload

PTOps có các cài đặt upload riêng cho bucket, ticket, và job. Các cài đặt này được dùng bởi uploader trên trình duyệt, và các giới hạn quan trọng cũng được enforce ở phía server.

### Upload Bucket

`client.bucket_upload_settings` kiểm soát upload vào [Storage Buckets](buckets.md):

```json
{
	"max_files_per_bucket": 100,
	"max_file_size": 1073741824,
	"accepted_file_types": ""
}
```

| Cài Đặt | Mô Tả |
|---------|-------------|
| `max_files_per_bucket` | Số file tối đa cho phép trong một bucket. |
| `max_file_size` | Kích thước tối đa của một file upload, tính bằng byte. |
| `accepted_file_types` | Chuỗi accept của bộ chọn file trình duyệt. Để trống nghĩa là mọi loại file. |

### Upload Ticket

`client.ticket_upload_settings` kiểm soát file đính kèm trên [Tickets](tickets.md):

```json
{
	"max_files_per_ticket": 100,
	"max_file_size": 1073741824,
	"accepted_file_types": ""
}
```

| Cài Đặt | Mô Tả |
|---------|-------------|
| `max_files_per_ticket` | Số file tối đa cho phép trên một ticket. |
| `max_file_size` | Kích thước tối đa của một file upload, tính bằng byte. |
| `accepted_file_types` | Chuỗi accept của bộ chọn file trình duyệt. Để trống nghĩa là mọi loại file. |

### Upload Job

`client.job_upload_settings` kiểm soát file được upload vào job, bao gồm chạy job thủ công và gửi qua Magic Form:

```json
{
	"max_files_per_job": 100,
	"max_file_size": 1073741824,
	"accepted_file_types": "",
	"user_file_expiration": "30 days",
	"plugin_file_expiration": "30 days"
}
```

| Cài Đặt | Mô Tả |
|---------|-------------|
| `max_files_per_job` | Số file tối đa cho phép cho một lần chạy job. Giới hạn ở cấp field có thể giảm thêm giá trị này. |
| `max_file_size` | Kích thước tối đa của một file upload, tính bằng byte. Giới hạn ở cấp field có thể giảm thêm giá trị này. |
| `accepted_file_types` | Chuỗi accept của bộ chọn file trình duyệt. Để trống nghĩa là mọi loại file. Quy tắc accept ở cấp field có thể override giá trị này. |
| `user_file_expiration` | Thời gian lưu giữ file input job do người dùng upload. |
| `plugin_file_expiration` | Thời gian lưu giữ file job do plugin tạo ra và upload. |

Các giá trị hết hạn dùng định dạng thời gian dễ đọc, như `30 days`, `12 hours`, hoặc `1 week`.

## Biến Môi Trường

Tất cả các cài đặt này có thể override bằng cú pháp biến môi trường `XYOPS_`. Dùng gạch dưới đôi cho đường dẫn object lồng nhau:

```sh
XYOPS_client__items_per_page="100"
XYOPS_client__alt_to_toggle="true"
XYOPS_client__tables__t_servers__sort_by="num_alerts"
XYOPS_client__tables__t_servers__sort_dir="-1"
```

Đối với mảng và object lớn hơn, chỉnh sửa `config.json` hoặc `overrides.json` thường rõ ràng hơn so với việc cố diễn tả toàn bộ cấu trúc bằng biến môi trường.

## Ghi Chú Bảo Mật

Các cài đặt `client` được gửi tới trình duyệt trước khi đăng nhập, vì vậy vui lòng không đặt secret, token riêng tư, password nội bộ, hoặc chi tiết infrastructure nhạy cảm ở bất cứ đâu dưới `client`.
