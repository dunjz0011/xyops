# API Reference

## Overview

Tài liệu này trình bày chi tiết về hệ thống REST API và API Key của PTOps. Tất cả các lệnh gọi API đều mong đợi JSON làm đầu vào (trừ khi chúng là HTTP GETs đơn giản) và sẽ trả về JSON dưới dạng đầu ra. Điểm cuối (endpoint) API chính là:

```
https://SERVER/api/app/NAME/v1
```

Thay thế `NAME` bằng hàm API cụ thể mà bạn đang gọi (xem danh sách bên dưới). Tất cả các yêu cầu nên là HTTP GET hoặc HTTP POST theo chỉ định của API và nên được hướng tới primary server PTOps của bạn. URL ví dụ:

```
http://sample.west.xyops.io/api/app/search_jobs/v1
```

## API Keys

API Keys cho phép bạn đăng ký các ứng dụng hoặc dịch vụ bên ngoài để sử dụng REST API. Chúng có thể được coi là các tài khoản người dùng đặc biệt dành riêng cho các ứng dụng. Mỗi API key có thể được cấp một tập hợp các đặc quyền cụ thể.

Để tạo một API Key, trước tiên bạn phải là người dùng cấp quản trị viên (administrator). Đăng nhập vào PTOps UI, tiến đến tab **API Keys** và nhấp vào nút "Add API Key...". Điền vào biểu mẫu và nhấp vào nút "Create Key" ở cuối trang.

API Keys là các chuỗi chữ và số được tạo ngẫu nhiên và mặc định có độ dài 24 ký tự. Chúng **có** phân biệt chữ hoa chữ thường. Ví dụ:

```
muJm8T6QSzqQzuO6MvbOdtlB
```

Bạn phải bao gồm một API Key hợp lệ trong mỗi yêu cầu API. Có ba cách để thực hiện việc này: bao gồm một HTTP request header `X-API-Key`, một tham số query string `api_key`, hoặc một thuộc tính JSON `api_key`.

Dưới đây là một HTTP request thô hiển thị cả ba phương pháp truyền API Key (chỉ yêu cầu một trong số các phương pháp này):

```
GET /api/app/search_jobs/v1?api_key=muJm8T6QSzqQzuO6MvbOdtlB HTTP/1.1
Host: sample.west.xyops.io
X-API-Key: muJm8T6QSzqQzuO6MvbOdtlB
Content-Type: application/json

{"query": "*", "offset": 0, "limit": 50, "api_key": "muJm8T6QSzqQzuO6MvbOdtlB"}
```

## Standard Response Format

Bất kể lệnh gọi API cụ thể mà bạn đã yêu cầu là gì, tất cả các phản hồi (responses) sẽ ở định dạng JSON và bao gồm ít nhất một thuộc tính `code`. Thuộc tính này sẽ được đặt thành `0` khi thành công, hoặc bất kỳ giá trị nào khác nếu có lỗi xảy ra. Trong trường hợp xảy ra lỗi, một thuộc tính `description` cũng sẽ được bao gồm, chứa chính thông báo lỗi. Các lệnh gọi API riêng lẻ có thể bao gồm các thuộc tính bổ sung, nhưng hai thuộc tính này là tiêu chuẩn trong tất cả các trường hợp. Ví dụ về phản hồi thành công:

```json
{
	"code": 0
}
```

Ví dụ về phản hồi lỗi:

```json
{
	"code": "session", 
	"description": "No Session ID or API Key could be found"
}
```

## Alerts

Các API alert quản lý các định nghĩa alert. Sử dụng các endpoint này để liệt kê, tìm nạp, tạo, cập nhật và xóa các alert đánh giá dữ liệu monitor và kích hoạt các action (email, web hooks, snapshots, và hơn thế nữa). Các alert chạy trên conductor và đánh giá các mẫu monitor đến từ các server; kết quả xuất hiện trong các dạng xem giám sát và nhật ký hoạt động. Việc chỉnh sửa các alert thường yêu cầu các đặc quyền thích hợp; các hoạt động đọc chỉ yêu cầu một session hợp lệ hoặc API Key.

Xem [Alerts](alerts.md) để biết thêm chi tiết về hệ thống alert của PTOps.

### get_alerts

```
GET /api/app/get_alerts/v1
```

Hàm này tìm nạp tất cả các định nghĩa alert hiện tại. Không có tham số đầu vào nào được định nghĩa. Không yêu cầu đặc quyền cụ thể nào, ngoài một user session hợp lệ hoặc API Key.

Ngoài [Standard Response Format](#standard-response-format), hàm này sẽ bao gồm một mảng `rows` chứa tất cả các alert, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không phân trang). Phản hồi ví dụ:

```json
{
	"code": 0,
	"rows": [
		{
			"id": "load_avg_high",
			"title": "High CPU Load",
			"expression": "monitors.load_avg >= (cpu.cores + 1)",
			"message": "CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)",
			"groups": [],
			"email": "",
			"web_hook": "",
			"monitor_id": "load_avg",
			"enabled": true,
			"samples": 1,
			"notes": "",
			"username": "admin",
			"modified": 1434125333,
			"created": 1434125333
		}
	],
	"list": { "length": 1 }
}
```

Ngoài [Standard Response Format](#standard-response-format), API này cũng sẽ bao gồm một mảng `rows` chứa thông tin về mọi định nghĩa alert, và một đối tượng `list` chứa siêu dữ liệu danh sách.

Xem [Alert](data.md#alert) để biết thêm chi tiết về các thuộc tính trên mỗi alert.

### get_alert

```
GET /api/app/get_alert/v1
```

Hàm này tìm nạp một định nghĩa alert duy nhất dựa trên ID của nó. Không yêu cầu đặc quyền cụ thể nào, ngoài một user session hợp lệ hoặc API Key. Cả HTTP GET với các tham số query string và HTTP POST với JSON đều được cho phép. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của alert cần tìm nạp. |

Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "load_avg_high"
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0,
	"alert": {
		"id": "load_avg_high",
		"title": "High CPU Load",
		"expression": "monitors.load_avg >= (cpu.cores + 1)",
		"message": "CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)",
		"groups": [],
		"email": "",
		"web_hook": "",
		"monitor_id": "load_avg",
		"enabled": true,
		"samples": 1,
		"notes": "",
		"username": "admin",
		"modified": 1434125333,
		"created": 1434125333
	}
}
```

Ngoài [Standard Response Format](#standard-response-format), API này cũng sẽ bao gồm một đối tượng `alert` chứa thông tin về alert được yêu cầu.

Xem [Alert](data.md#alert) để biết thêm chi tiết về các thuộc tính của alert.

### create_alert

```
POST /api/app/create_alert/v1
```

Hàm này tạo một định nghĩa alert mới. Yêu cầu đặc quyền [create_alerts](privileges.md#create_alerts), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Xem [Alert](data.md#alert) để biết chi tiết về các thuộc tính đầu vào. Các thuộc tính `id`, `username`, `created` và `modified` có thể được bỏ qua, vì chúng được tạo tự động. Dưới đây là một yêu cầu ví dụ:

```json
{
	"title": "High CPU Load",
	"expression": "monitors.load_avg >= (cpu.cores + 1)",
	"message": "CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)",
	"groups": [],
	"email": "",
	"web_hook": "",
	"monitor_id": "load_avg",
	"enabled": true,
	"samples": 1,
	"notes": ""
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0,
	"alert": {...}
}
```

Ngoài [Standard Response Format](#standard-response-format), API này cũng sẽ bao gồm một đối tượng `alert` chứa alert vừa được tạo (bao gồm tất cả các thuộc tính được tạo tự động).

Xem [Alert](data.md#alert) để biết thêm chi tiết về các thuộc tính của alert.

### update_alert

```
POST /api/app/update_alert/v1
```

Hàm này cập nhật một định nghĩa alert hiện có, được chỉ định bởi ID của nó. Yêu cầu đặc quyền [edit_alerts](privileges.md#edit_alerts), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Xem [Alert](data.md#alert) để biết chi tiết về các thuộc tính đầu vào. Yêu cầu được hợp nhất nông ("shallow-merged") vào alert hiện có, vì vậy bạn có thể cung cấp một tập hợp thưa thớt các thuộc tính để cập nhật. Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "load_avg_high",
	"title": "High CPU Load",
	"expression": "monitors.load_avg >= (cpu.cores + 1)"
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0
}
```

Ví dụ trên sẽ cập nhật `title` và `expression` của alert có ID `load_avg_high`. Các thuộc tính khác trong alert sẽ không bị thay đổi (ngoại trừ `modified` luôn được cập nhật, và một số thuộc tính nội bộ khác).

### test_alert

```
POST /api/app/test_alert/v1
```

Hàm này kiểm tra cấu hình của một alert, cụ thể là các thuộc tính `expression` và `message`, đối với một server được chỉ định. Nó kiểm tra cả cú pháp của các thuộc tính bằng cách biên dịch trước chúng, và nó cũng đánh giá chúng dựa trên dữ liệu server được chỉ định, để bạn có thể xem liệu alert có kích hoạt dựa trên các điều kiện hiện tại hay không. Yêu cầu đặc quyền [edit_alerts](privileges.md#edit_alerts), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `server` | String | **(Required)** ID chữ và số của server để kiểm tra expression và message. |
| `expression` | String | **(Required)** Expression của alert cần kiểm tra. |
| `message` | String | **(Required)** Message của alert cần kiểm tra. |

Dưới đây là một yêu cầu ví dụ:

```json
{
	"server": "s12345abcde",
	"expression": "monitors.load_avg >= (cpu.cores + 1)",
	"message": "CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)"
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0,
	"result": false,
	"message": "CPU load average is too high: 2.5 (2 CPU cores)"
}
```

Ngoài [Standard Response Format](#standard-response-format), API này cũng sẽ bao gồm một boolean `result` cho biết liệu alert có kích hoạt với dữ liệu server hiện tại hay không, và một chuỗi `message` chứa message đã được đánh giá.

### delete_alert

```
POST /api/app/delete_alert/v1
```

Hàm này xóa một định nghĩa alert, được chỉ định bởi ID của nó. Yêu cầu đặc quyền [delete_alerts](privileges.md#delete_alerts), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của alert cần xóa. |

Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "load_avg_high"
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0
}
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

## Buckets

Storage bucket là một thùng chứa logic để lưu trữ các tệp, để sử dụng trong các event và workflow. Các bucket có thể chứa một số lượng tệp tùy ý và dữ liệu JSON.

Các API bucket định nghĩa và quản lý các bucket, siêu dữ liệu, các blob dữ liệu và danh sách tệp của chúng. Sử dụng chúng để liệt kê, tìm nạp, tạo, cập nhật và xóa các bucket; và để tải lên/tải xuống/xóa các tệp liên kết với một bucket. Các job và workflow có thể đọc và ghi nội dung bucket trong thời gian chạy (ví dụ: trao đổi đầu vào/đầu ra). Các hoạt động siêu dữ liệu thường yêu cầu các đặc quyền tạo/chỉnh sửa/xóa; việc liệt kê và tìm nạp chỉ yêu cầu một session hợp lệ hoặc API Key.

### get_buckets

```
GET /api/app/get_buckets/v1
```

Hàm này tìm nạp tất cả các định nghĩa storage bucket hiện tại (không bao gồm dữ liệu và tệp thực tế). Không có tham số đầu vào nào được định nghĩa. Không yêu cầu đặc quyền cụ thể nào, ngoài một user session hợp lệ hoặc API Key.

Ngoài [Standard Response Format](#standard-response-format), hàm này sẽ bao gồm một mảng `rows` chứa tất cả các bucket, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không phân trang). Phản hồi ví dụ:

```json
{
	"code": 0,
	"rows": [
		{
			"id": "bme4wi6pg35",
			"title": "The Void",
			"enabled": true,
			"icon": "",
			"notes": "",
			"username": "admin",
			"modified": 1754783050,
			"created": 1754783023,
			"revision": 2
		}
	],
	"list": { "length": 1 }
}
```

Ngoài [Standard Response Format](#standard-response-format), API này cũng sẽ bao gồm một mảng `rows` chứa thông tin về mọi định nghĩa bucket, và một đối tượng `list` chứa siêu dữ liệu danh sách.

Xem [Bucket](data.md#bucket) để biết thêm chi tiết về các thuộc tính trên mỗi bucket.

### get_bucket

```
GET /api/app/get_bucket/v1
```

Hàm này lấy định nghĩa của một storage bucket cụ thể, bao gồm dữ liệu và danh sách tệp của nó. Không yêu cầu đặc quyền cụ thể nào, ngoài một user session hợp lệ hoặc API Key. Dưới đây là các tham số đầu vào:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của bucket cần lấy. |

Và dưới đây là một phản hồi ví dụ:

```json
{
	"code": 0,
	"bucket": {
		"id": "bme4wi6pg35",
		"title": "The Void",
		"enabled": true,
		"icon": "",
		"notes": "",
		"username": "admin",
		"modified": 1754783050,
		"created": 1754783023,
		"revision": 2
	},
	"data": {
		"foo": "Hello this is a bucket"
	},
	"files": [
		{
			"id": "fme4wijr73h",
			"date": 1754783040,
			"filename": "test.png",
			"path": "files/bucket/bme4wi6pg35/bdY8zZ9nKynfFUb4xH6fA/test.png",
			"size": 92615,
			"username": "admin"
		}
	]
}
```

Xem [Bucket](data.md#bucket) để biết thêm chi tiết về các thuộc tính trong đối tượng `bucket`. Đối tượng `data` sẽ được điền bằng dữ liệu của bucket, tất cả đều do người dùng định nghĩa. Mảng `files` là danh sách tất cả các tệp trong bucket, nếu có. Để tải xuống một tệp, hãy sử dụng thuộc tính `path`, thêm vào phía trước với base URL của ứng dụng (và một dấu gạch chéo).

### create_bucket

```
POST /api/app/create_bucket/v1
```

Hàm này tạo một storage bucket mới. Yêu cầu đặc quyền [create_buckets](privileges.md#create_buckets), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Xem [Bucket](data.md#bucket) để biết chi tiết về các thuộc tính đầu vào. Các thuộc tính `id`, `username`, `created` và `modified` có thể được bỏ qua, vì chúng được tạo tự động. Dưới đây là một yêu cầu ví dụ:

```json
{
	"title": "The Void",
	"enabled": true,
	"icon": "",
	"notes": "",
	"data": {
		"foo": "Hello this is a bucket"
	}
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0,
	"bucket": {...}
}
```

Ngoài [Standard Response Format](#standard-response-format), API này cũng sẽ bao gồm một đối tượng `bucket` chứa bucket vừa được tạo (bao gồm tất cả các thuộc tính được tạo tự động).

Như bạn có thể thấy trong ví dụ trên, bạn có thể chỉ định dữ liệu bucket do người dùng định nghĩa cùng với việc tạo chính bucket đó. Tuy nhiên, các tệp bucket cần được tải lên riêng biệt (xem [upload_bucket_files](#upload_bucket_files)).

Xem [Bucket](data.md#bucket) để biết thêm chi tiết về các thuộc tính của bucket.

### update_bucket

```
POST /api/app/update_bucket/v1
```

Hàm này cập nhật một storage bucket hiện có, được chỉ định bởi ID của nó. Yêu cầu đặc quyền [edit_buckets](privileges.md#edit_buckets), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Xem [Bucket](data.md#bucket) để biết chi tiết về các thuộc tính đầu vào. Yêu cầu được hợp nhất nông ("shallow-merged") vào bucket hiện có, vì vậy bạn có thể cung cấp một tập hợp thưa thớt các thuộc tính để cập nhật. Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "bme4wi6pg35",
	"title": "The Void",
	"data": {
		"foo": "Hello this is a bucket"
	}
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0
}
```

Ví dụ trên sẽ cập nhật `title` và `data` của bucket có ID `bme4wi6pg35`. Các thuộc tính khác trong bucket sẽ không bị thay đổi (ngoại trừ `modified` luôn được cập nhật, và một số thuộc tính nội bộ khác).

### delete_bucket

```
POST /api/app/delete_bucket/v1
```

Hàm này xóa một storage bucket, bao gồm tất cả dữ liệu và tệp, được chỉ định bởi ID của nó. Yêu cầu đặc quyền [delete_buckets](privileges.md#delete_buckets), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của bucket cần xóa. |

Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "bme4wi6pg35"
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0
}
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### write_bucket_data

```
POST /api/app/write_bucket_data/v1
```

API này cho phép bạn ghi dữ liệu bucket vào một storage bucket. Yêu cầu đặc quyền [edit_buckets](privileges.md#edit_buckets), cũng như một user session hợp lệ hoặc API Key. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của bucket để ghi dữ liệu vào. |
| `data` | Object | **(Required)** Đối tượng dữ liệu để hợp nhất nông vào dữ liệu bucket. |
| `fetch` | Boolean | Cờ tùy chọn yêu cầu toàn bộ đối tượng dữ liệu được trả về trong phản hồi API. |

Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "bme4wi6pg35",
	"fetch": true,
	"data": { "foo": "bar" }
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0,
	"data": { "foo": "bar", "other": 12345 }
}
```

Đáng chú ý, dữ liệu được truyền tới API này được *hợp nhất nông* vào dữ liệu bucket. Bằng cách này, nhiều "client" có thể đọc/ghi dữ liệu vào cùng một bucket mà không ảnh hưởng lẫn nhau (miễn là họ sử dụng các tên thuộc tính duy nhất). Khóa (locking) được sử dụng để đảm bảo chỉ có một hoạt động đọc/ghi diễn ra tại một thời điểm. Nếu nhiều client ghi cùng một tên thuộc tính, tên ghi sau sẽ được ưu tiên.

API này được thiết kế để được gọi từ bên trong các job (nghĩa là các script Event Plugin), vì vậy nó không tự cập nhật bản ghi bucket, cũng như không ghi nhật ký một giao dịch của người dùng.

### upload_bucket_files

```
POST /api/app/upload_bucket_files/v1
```

API này cho phép bạn tải tệp lên một storage bucket. Không giống như hầu hết các API khác, API này xử lý các tệp, vì vậy nó yêu cầu một yêu cầu kiểu `multipart/form-data`. Các tham số phải là các tham số HTTP POST thực tế, thay vì các khóa JSON. Yêu cầu đặc quyền [edit_buckets](privileges.md#edit_buckets), cũng như một user session hợp lệ hoặc API Key. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của bucket để tải tệp lên. |

Các thuộc tính tệp được tự động thiết lập dựa trên chính các tệp của người dùng, bao gồm tên tệp, kích thước tệp, v.v. Tham số `id` được sử dụng để chỉ định bucket đích cho quá trình tải lên.

Lưu ý rằng các tệp bucket được tự động thêm hoặc thay thế dựa trên tên tệp chuẩn hóa của chúng. Việc chuẩn hóa liên quan đến việc chuyển đổi bất kỳ thứ gì khác ngoài chữ và số, dấu gạch ngang và dấu chấm thành dấu gạch dưới, và chuyển đổi tên tệp thành chữ thường.

API này được thiết kế để được gọi từ bên trong các job (nghĩa là các script Event Plugin), vì vậy nó không tự cập nhật bản ghi bucket, cũng như không ghi nhật ký một giao dịch của người dùng.

### delete_bucket_file

```
POST /api/app/delete_bucket_file/v1
```

API này xóa một tệp khỏi một storage bucket. Yêu cầu đặc quyền [edit_buckets](privileges.md#edit_buckets), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của bucket để xóa tệp khỏi. |
| `filename` | String | **(Required)** Tên tệp chuẩn hóa của tệp cần xóa. |
	
Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "bme4wi6pg35",
	"filename": "test.png"
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0
}
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### empty_bucket

```
POST /api/app/empty_bucket/v1
```

API này làm trống một bucket, nghĩa là nó sẽ xóa tất cả các tệp và/hoặc dữ liệu, nhưng để nguyên bản thân bucket. Yêu cầu đặc quyền [edit_buckets](privileges.md#edit_buckets), cũng như một user session hợp lệ hoặc API Key. Các tham số đầu vào như sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID chữ và số của bucket cần làm trống. |
| `files` | Boolean | **(Required)** Đặt thành `true` để xóa tất cả các tệp khỏi bucket. |
| `data` | Boolean | **(Required)** Đặt thành `true` để xóa tất cả dữ liệu khỏi bucket. |
	
Dưới đây là một yêu cầu ví dụ:

```json
{
	"id": "bme4wi6pg35",
	"files": true,
	"data": true
}
```

Và một phản hồi ví dụ:

```json
{
	"code": 0
}
```

Việc làm trống là vĩnh viễn và không thể hoàn tác.

## Categories

Các API category sắp xếp các event thành các nhóm logic để điều hướng, kiểm soát truy cập và tìm kiếm. Sử dụng chúng để liệt kê, tìm nạp, tạo, cập nhật, sắp xếp lại và xóa các category. Việc gán một event cho một category ảnh hưởng đến khả năng hiển thị của người dùng (thông qua các vai trò) và việc lọc tìm kiếm. Việc chỉnh sửa các category thường yêu cầu các đặc quyền; việc đọc chỉ yêu cầu một session hợp lệ hoặc API Key.

### get_categories

```
GET /api/app/get_categories/v1
```

Tìm nạp tất cả các định nghĩa category. Không yêu cầu tham số đầu vào nào. Không yêu cầu đặc quyền cụ thể nào ngoài một user session hợp lệ hoặc API Key. Ngoài [Standard Response Format](#standard-response-format), phản hồi bao gồm một mảng `rows` gồm các category và một đối tượng `list` với siêu dữ liệu tóm tắt. Giá trị `list.length` là tổng số category (mà không phân trang).

Phản hồi ví dụ:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "general",
            "title": "General",
            "enabled": true,
            "sort_order": 0,
            "username": "admin",
            "modified": 1754365754,
            "created": 1754365754,
            "notes": "For events that don't fit anywhere else.",
            "color": "plain",
            "icon": "",
            "limits": [],
            "actions": [],
            "revision": 1
        }
        
    ],
    "list": { "length": 1 }
}
```

Xem [Category](data.md#category) để biết thêm chi tiết về các thuộc tính của category.
### get_category

```
GET /api/app/get_category/v1
```

Lấy thông tin định nghĩa của một category thông qua ID. Không yêu cầu quyền đặc biệt nào ngoài việc có một phiên đăng nhập hợp lệ hoặc API Key. Cả HTTP GET với các tham số chuỗi truy vấn (query string parameters) và HTTP POST với JSON đều được chấp nhận. Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của category cần lấy. |

Yêu cầu ví dụ:

```json
{
    "id": "general"
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "category": {
        "id": "general",
        "title": "General",
        "enabled": true,
        "sort_order": 0,
        "username": "admin",
        "modified": 1754365754,
        "created": 1754365754,
        "notes": "For events that don't fit anywhere else.",
        "color": "plain",
        "icon": "",
        "limits": [],
        "actions": [],
        "revision": 1
    }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi sẽ bao gồm một thuộc tính `category` chứa thông tin định nghĩa của category được yêu cầu. Xem [Category](data.md#category) để biết chi tiết về các thuộc tính của category.

### create_category

```
POST /api/app/create_category/v1
```

Tạo một category mới. Yêu cầu quyền [create_categories](privileges.md#create_categories) và quyền truy cập ở cấp độ category đối với ID được chỉ định (đối với các tài khoản bị giới hạn category), cùng với một phiên đăng nhập hợp lệ hoặc API Key. Gửi dưới dạng HTTP POST với JSON. Xem [Category](data.md#category) để biết chi tiết về thuộc tính. Tham số `id` có thể bị bỏ qua và sẽ được tự động tạo; `username`, `created`, `modified`, `revision`, và `sort_order` được thiết lập bởi server.

Yêu cầu ví dụ:

```json
{
    "title": "General",
    "enabled": true,
    "color": "plain",
    "icon": "",
    "notes": "For events that don't fit anywhere else.",
    "limits": [],
    "actions": []
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "category": { /* full category object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi sẽ bao gồm một thuộc tính `category` chứa toàn bộ đối tượng category bao gồm cả các trường được tự động tạo.

Ghi chú:

- server sẽ xác thực các [Limits](data.md#limit) và [Actions](data.md#action).
- `sort_order` được tự động gán ở cuối danh sách hiện tại.

### update_category

```
POST /api/app/update_category/v1
```

Cập nhật một category hiện có thông qua ID. Yêu cầu quyền [edit_categories](privileges.md#edit_categories) và quyền truy cập ở cấp độ category đối với ID được chỉ định (đối với các tài khoản bị giới hạn category), cùng với một phiên đăng nhập hợp lệ hoặc API Key. Gửi dưới dạng HTTP POST với JSON. Yêu cầu này sẽ được hợp nhất nông (shallow-merged) vào category hiện có, do đó bạn có thể cung cấp một tập hợp các thuộc tính thưa thớt để cập nhật. server sẽ cập nhật `modified` và tự động tăng `revision`.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID category cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Category](data.md#category) nào có thể cập nhật (ví dụ: `title`, `enabled`, `color`, `notes`, `limits`, `actions`). |

Yêu cầu ví dụ:

```json
{
    "id": "general",
    "title": "General Jobs",
    "color": "blue"
}
```

Phản hồi ví dụ:

```json
{
    "code": 0
}
```

Xem [Limit](data.md#limit) và [Action](data.md#action) để biết các cấu trúc lồng nhau.

### delete_category

```
POST /api/app/delete_category/v1
```

Xóa một category hiện có thông qua ID. Yêu cầu quyền [delete_categories](privileges.md#delete_categories) và quyền truy cập ở cấp độ category đối với ID được chỉ định (đối với các tài khoản bị giới hạn category), cùng với một phiên đăng nhập hợp lệ hoặc API Key. Việc xóa sẽ bị chặn nếu có bất kỳ [Events](data.md#event) nào được gán cho category đó.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID category cần xóa. |

Yêu cầu ví dụ:

```json
{
    "id": "general"
}
```

Phản hồi ví dụ:

```json
{
    "code": 0
}
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### multi_update_category

```
POST /api/app/multi_update_category/v1
```

Cập nhật nhiều category trong một lệnh gọi duy nhất. Endpoint này chỉ dành cho việc cập nhật `sort_order` (ví dụ: sau khi kéo thả sắp xếp lại trên giao diện người dùng). Yêu cầu quyền [edit_categories](privileges.md#edit_categories) và quyền truy cập ở cấp độ category đối với tất cả category (`*`), cùng với một phiên đăng nhập hợp lệ hoặc API Key.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `items` | Array(Object) | **(Bắt buộc)** Mảng các đối tượng, mỗi đối tượng có một `id` và một `sort_order` mới. |

Yêu cầu ví dụ:

```json
{
    "items": [
        { "id": "general", "sort_order": 0 },
        { "id": "logs",    "sort_order": 1 }
    ]
}
```

Phản hồi ví dụ:

```json
{
    "code": 0
}
```

Ghi chú:

- Chỉ `sort_order` được cập nhật bởi endpoint này.
- `modified` và `revision` được thiết kế là không cập nhật cho thao tác multi-updates của sort order.



## Channels

Channel APIs quản lý các channel thông báo (ví dụ: danh sách email, nhắc đến người dùng, web hook tùy chọn hoặc job tiếp nối). Sử dụng chúng để liệt kê, lấy, tạo, cập nhật và xóa các channel mà các alerts hoặc actions có thể nhắm tới. Các channels tập trung hóa cách các thông báo được phân phối để các events và alerts có thể tham chiếu chúng thông qua ID. Việc chỉnh sửa các channels yêu cầu các quyền; việc liệt kê và lấy thông tin yêu cầu một phiên hợp lệ hoặc API Key.

### get_channels

```
GET /api/app/get_channels/v1
```

Lấy tất cả các định nghĩa notification channel. Không yêu cầu tham số đầu vào nào. Không yêu cầu quyền đặc biệt nào ngoài một phiên người dùng hợp lệ hoặc API Key.

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một mảng `rows` chứa tất cả các channels, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không phân trang).

Phản hồi ví dụ:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "sev1",
            "title": "Severity 1",
            "enabled": true,
            "username": "admin",
            "modified": 1754603045,
            "created": 1754365754,
            "notes": "For major events that require everyone's attention right away.",
            "users": ["admin"],
            "email": "",
            "web_hook": "",
            "run_event": "",
            "sound": "attention-3.mp3",
            "icon": "",
            "revision": 3,
            "max_per_day": 0
        }
        
    ],
    "list": { "length": 1 }
}
```

Xem [Channel](data.md#channel) để biết chi tiết về các thuộc tính channel.

### get_channel

```
GET /api/app/get_channel/v1
```

Lấy một định nghĩa channel duy nhất bằng ID. Không yêu cầu đặc quyền nào ngoài một phiên người dùng hợp lệ hoặc API Key. Chấp nhận cả HTTP GET với các tham số query string và HTTP POST với JSON.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của channel cần lấy. |

Yêu cầu ví dụ:

```json
{
    "id": "sev1"
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "channel": {
        "id": "sev1",
        "title": "Severity 1",
        "enabled": true,
        "username": "admin",
        "modified": 1754603045,
        "created": 1754365754,
        "notes": "For major events that require everyone's attention right away.",
        "users": ["admin"],
        "email": "",
        "web_hook": "",
        "run_event": "",
        "sound": "attention-3.mp3",
        "icon": "",
        "revision": 3,
        "max_per_day": 0
    }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi sẽ bao gồm một đối tượng `channel` chứa channel được yêu cầu.

Xem [Channel](data.md#channel) để biết chi tiết về các thuộc tính channel.

### create_channel

```
POST /api/app/create_channel/v1
```

Tạo một notification channel mới. Yêu cầu đặc quyền [create_channels](privileges.md#create_channels), cùng với một phiên người dùng hợp lệ hoặc API Key. Gửi bằng HTTP POST với JSON. Xem chi tiết thuộc tính tại [Channel](data.md#channel). `id` có thể được bỏ qua và sẽ được tự động tạo; `username`, `created`, `modified`, và `revision` được thiết lập bởi server.

Yêu cầu ví dụ:

```json
{
    "title": "Severity 1",
    "enabled": true,
    "notes": "For major events that require everyone's attention right away.",
    "users": ["admin"],
    "email": "",
    "web_hook": "",
    "run_event": "",
    "sound": "attention-3.mp3",
    "icon": "",
    "max_per_day": 0
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "channel": { /* full channel object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi sẽ bao gồm một đối tượng `channel` chứa channel mới được tạo.

### update_channel

```
POST /api/app/update_channel/v1
```

Cập nhật một channel hiện có thông qua ID. Yêu cầu đặc quyền [edit_channels](privileges.md#edit_channels), cùng với một phiên người dùng hợp lệ hoặc API Key. Gửi qua HTTP POST với JSON. Yêu cầu này được hợp nhất nông vào channel hiện có, vì vậy bạn có thể cung cấp một tập hợp các thuộc tính thưa thớt để cập nhật. Server sẽ tự động cập nhật `modified` và tăng `revision`.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID channel cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Channel](data.md#channel) nào có thể cập nhật (ví dụ: `title`, `enabled`, `users`, `email`, `web_hook`, `run_event`, `sound`, `icon`, `max_per_day`, `notes`). |

Yêu cầu ví dụ:

```json
{
    "id": "sev1",
    "title": "Severity 1 Alerts",
    "max_per_day": 5
}
```

Phản hồi ví dụ:

```json
{
    "code": 0
}
```

### delete_channel

```
POST /api/app/delete_channel/v1
```

Xóa một channel hiện có bằng ID. Yêu cầu đặc quyền [delete_channels](privileges.md#delete_channels), cùng với một phiên người dùng hợp lệ hoặc API Key.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID channel cần xóa. |

Yêu cầu ví dụ:

```json
{
    "id": "sev1"
}
```

Phản hồi ví dụ:

```json
{
    "code": 0
}
```

Các thao tác xóa là vĩnh viễn và không thể hoàn tác.



## Events

Event APIs định nghĩa các jobs cần chạy (cái gì, khi nào, và như thế nào). Sử dụng chúng để liệt kê, lấy, tạo, cập nhật, xóa các events, và để kích hoạt chạy ngay lập tức. Các events tham chiếu đến các plugins, categories, secrets, schedules/triggers và actions; việc tạo hoặc chỉnh sửa các events sẽ thực thi việc xác thực tham số và các đặc quyền của người dùng. Việc chạy events sẽ khởi chạy các jobs trên các servers đích dựa trên cấu hình scheduler và định tuyến.

### get_events

```
GET /api/app/get_events/v1
```

Lấy tất cả các định nghĩa event, hoặc có tùy chọn lọc các kết quả. Không yêu cầu quyền đặc biệt nào ngoài một phiên người dùng hợp lệ hoặc API Key.

Mặc định, tất cả các events được trả về. Để giới hạn các kết quả theo các tiêu chí cụ thể, hãy chỉ định bất kỳ thuộc tính [Event](data.md#event) cấp cao nhất nào dưới dạng các tham số GET hoặc POST. Đây là một ví dụ về yêu cầu sẽ lấy tất cả các events đã bật đang sử dụng Shell Plugin có sẵn:

```json
{
	"enabled": true,
	"plugin": "shellplug"
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một mảng `rows` chứa tất cả các events, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` đối với tổng số hàng mà không phân trang). Thuộc tính phản hồi `list.length` luôn phản ánh tổng số event, bất kể có lọc hay không.

Phản hồi ví dụ:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "event100",
            "title": "Diverse heuristic complexity",
            "enabled": true,
            "username": "admin",
            "modified": 1653843747,
            "created": 1651348186,
            "category": "cat9",
            "targets": ["main"],
            "notes": "This is a test event.",
            "limits": [
                { "type": "time", "enabled": true, "duration": 3600 }
            ],
            "actions": [
                { "enabled": true, "condition": "error", "type": "email", "email": "admin@localhost" }
            ],
            "plugin": "shellplug",
            "params": { "script": "#!/bin/bash\n\nsleep 30;\necho HELLO;\n", "annotate": false, "json": false },
            "triggers": [
                { "type": "schedule", "enabled": true, "hours": [19], "minutes": [6] }
            ],
            "icon": "",
            "tags": ["important"],
            "algo": "random"
        }
        
    ],
    "list": { "length": 1 }
}
```

Xem [Event](data.md#event) để biết chi tiết về các thuộc tính event.

### get_event

```
GET /api/app/get_event/v1
```

Lấy một định nghĩa event duy nhất bằng ID. Không yêu cầu quyền đặc biệt nào ngoài một phiên người dùng hợp lệ hoặc API Key. Cả HTTP GET với các tham số query string và HTTP POST với JSON đều được chấp nhận.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của event cần lấy. |

Yêu cầu ví dụ:

```json
{
    "id": "event100"
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "event": { /* full event object */ },
    "jobs": [ /* currently active jobs for this event */ ],
    "queued": 0
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi sẽ bao gồm một đối tượng `event` chứa event được yêu cầu, một mảng `jobs` chứa các jobs hiện đang chạy cho event đó, và một số `queued` cho biết số lượng jobs đang xếp hàng đợi.

Xem [Event](data.md#event) để biết chi tiết về các thuộc tính event, và [Job](data.md#job) để biết các thuộc tính job.

### get_event_history

```
GET /api/app/get_event_history/v1
```

Lấy lịch sử sửa đổi (revision history) cho một event cụ thể từ nhật ký hoạt động. Yêu cầu một phiên người dùng hợp lệ hoặc API Key, và quyền truy cập category/target vào event.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID event cần lấy lịch sử. |
| `offset` | Number | Tùy chọn row offset để phân trang. Mặc định là `0`. |
| `limit` | Number | Tùy chọn row limit để phân trang. Mặc định là `1`. |
| `sort_by` | String | Tùy chọn trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tùy chọn hướng sắp xếp. Sử dụng `-1` cho giảm dần (mặc định) hoặc `1` cho tăng dần. |

Yêu cầu ví dụ:

```json
{
    "id": "event100",
    "offset": 0,
    "limit": 50
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "rows": [
        { "action": "event_update", "username": "admin", "description": "Updated title", "date": 1754784000 }
        
    ],
    "list": { "length": 1 }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một mảng `rows` chứa các bản ghi hoạt động liên quan đến event, và một đối tượng `list` chứa siêu dữ liệu phân trang.

### create_event

```
POST /api/app/create_event/v1
```

Tạo một event mới. Yêu cầu đặc quyền [create_events](privileges.md#create_events), cộng thêm quyền truy cập category/target cho event, và một phiên người dùng hợp lệ hoặc API Key. Gửi bằng HTTP POST với JSON. Xem [Event](data.md#event) để biết chi tiết thuộc tính. `id` có thể được bỏ qua và sẽ tự động được tạo; `username`, `created`, và `modified` được thiết lập bởi server.

Ghi chú:

- Đối với các events không phải workflow, các `targets` và `plugin` là bắt buộc.
- Đối với các workflow events (`type: "workflow"`), server thiết lập `plugin` thành `_workflow` và yêu cầu một đối tượng `workflow`; các `targets` là không bắt buộc.
- Các tham số plugin/event bị khóa sẽ được thực thi đối với những người không phải là quản trị viên (non-admins) và các trường bắt buộc sẽ được xác thực.

Yêu cầu ví dụ (non-workflow event):

```json
{
    "title": "Diverse heuristic complexity",
    "enabled": true,
    "category": "cat9",
    "targets": ["main"],
    "plugin": "shellplug",
    "params": { "script": "#!/bin/bash\necho HELLO\n" },
    "triggers": [ { "type": "manual", "enabled": true } ]
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
    "event": { /* full event object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi sẽ bao gồm một đối tượng `event` chứa event mới được tạo.

### update_event

```
POST /api/app/update_event/v1
```

Cập nhật một event hiện có bằng ID. Yêu cầu quyền [edit_events](privileges.md#edit_events), cộng thêm quyền truy cập category/target vào event, và một phiên người dùng hợp lệ hoặc API Key. Gửi qua HTTP POST với JSON. Yêu cầu này được hợp nhất nông vào event hiện có, vì vậy bạn có thể cung cấp một tập hợp các thuộc tính thưa thớt để cập nhật. Server sẽ tự động cập nhật `modified` và tăng `revision`.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID event cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Event](data.md#event) nào có thể cập nhật (ví dụ: `title`, `enabled`, `category`, `targets`, `algo`, `plugin`, `params`, `triggers`, `limits`, `actions`, `notes`). |

Hành vi đặc biệt:

- Đối với người dùng không phải admin (non-admins), các tham số plugin/event bị khóa sẽ được thực thi; các trường bắt buộc phải có mặt.
- Bạn có thể cập nhật trạng thái trên mỗi event (per-event state) bằng cách truyền `update_state` dưới dạng một đối tượng gồm các cặp khóa/giá trị (key/value pairs). Chúng được lưu trữ trong trạng thái event (event state) và bị xóa khỏi bản thân bản ghi event.

Yêu cầu ví dụ:

```json
{
    "id": "event100",
    "title": "Diverse heuristic complexity (v2)",
    "limits": [ { "type": "time", "enabled": true, "duration": 1800 } ],
    "update_state": { "cursor": 1234 }
}
```

Phản hồi ví dụ:

```json
{
    "code": 0,
	"event": { /* fully updated event object */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một đối tượng `event` chứa event đã được cập nhật.

`update_state` được sử dụng để thiết lập lại con trỏ thời gian (time cursor) của event đối với chế độ [Catch-Up](triggers.md#catch-up).
### delete_event

```
POST /api/app/delete_event/v1
```

Xóa một event đã có theo ID. Yêu cầu quyền [delete_events](privileges.md#delete_events), cộng với quyền truy cập category/target vào event, và một phiên người dùng hoặc API Key hợp lệ. Việc xóa sẽ bị chặn nếu có bất kỳ job nào đang hoạt động cho event. Bạn có thể tùy chọn yêu cầu xóa tất cả lịch sử job của event.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của event cần xóa. |
| `delete_jobs` | Boolean | Tùy chọn. Nếu `true`, xóa tất cả lịch sử job của event (thực hiện ở chế độ nền). |

Ví dụ request:

```json
{
    "id": "event100",
    "delete_jobs": true
}
```

Ví dụ response:

```json
{
    "code": 0
}
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### run_event

```
POST /api/app/run_event/v1
```

Chạy một event theo yêu cầu với các ghi đè tùy chọn và tải lên tệp tùy chọn. Yêu cầu quyền [run_jobs](privileges.md#run_jobs), cộng với quyền truy cập category/target vào event, và một phiên người dùng hoặc API Key hợp lệ.

Quy tắc chạy thủ công:

- Event phải có một trigger `manual` được bật, trừ khi bạn truyền `test: true`.
- Các event bị vô hiệu hóa không thể được chạy trừ khi bạn truyền `test: true`.

Các định dạng đầu vào:

- JSON thuần: Gửi `Content-Type: application/json` với phần body là JSON.
- Multipart form-data (để tải lên tệp): Gửi `Content-Type: multipart/form-data` và bao gồm trường `json` chứa toàn bộ payload JSON (dưới dạng chuỗi), cộng với một hoặc nhiều trường tệp. Tất cả các tệp được tải lên sẽ được đính kèm vào `input.files` cho job.

Các tham số (cốt lõi):

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | ID của event để chạy. Bắt buộc một trong hai `id` hoặc `title`. |
| `title` | String | Tiêu đề của event để chạy (thay thế cho `id`). |
| `params` | Object | Các ghi đè tùy chọn cho [Event.params](data.md#event-params). Các khóa bị thiếu sẽ trở về các params đã lưu của event. |
| `input` | Object | Đối tượng đầu vào tùy chọn; có thể bao gồm `data` và/hoặc `files` (xem [Job.input](data.md#job-input)). Các tệp được tải lên sẽ được nối vào `input.files`. |
| `test` | Boolean | Nếu `true`, bỏ qua các kiểm tra kích hoạt thủ công và được bật, và đánh dấu job là test. |
| `tags` | Array | Tùy chọn ghi đè các tag được thiết lập trong event. Chỉ định một hoặc nhiều [Tag.id](data.md#tag-id) trong mảng. |

Các hành vi bổ sung:

- Bất kỳ thuộc tính nào từ event đều có thể được ghi đè ở đây. Xem cấu trúc dữ liệu [Event](data.md#event) để biết thêm chi tiết.
- Các khóa lồng nhau sử dụng `parent/child` có thể được cung cấp dưới dạng các tham số phẳng (ví dụ: `params/foo=bar`).
- Khi sử dụng tải lên multipart, trường `json` phải chứa chính xác JSON mà bạn sẽ POST.
- Nếu tham số truy vấn `post_data` hiện diện, tất cả các trường POST thô sẽ được đặt dưới `post_data` thay vì được hợp nhất (cách sử dụng nâng cao).
- Những người không phải quản trị viên sẽ bị áp dụng các tham số plugin/event đã khóa; các trường bắt buộc phải có.

Ví dụ: POST JSON (không có tệp)

```json
{
    "id": "event100",
    "params": { "foo": "bar" },
    "input": { "data": { "greeting": "hello" } }
}
```

Ví dụ: multipart/form-data có tệp

```
POST /api/app/run_event/v1
Content-Type: multipart/form-data; boundary=----XYZ

------XYZ
Content-Disposition: form-data; name="json"

{"id":"event100","params":{"foo":"bar"}}
------XYZ
Content-Disposition: form-data; name="file1"; filename="input.csv"
Content-Type: text/csv

id,value\n1,alpha\n2,beta\n
------XYZ
Content-Disposition: form-data; name="file2"; filename="notes.txt"
Content-Type: text/plain

hello world
------XYZ--
```

Ví dụ response:

```json
{
    "code": 0,
    "id": "jabc123def" 
}
```

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một thuộc tính `id` chứa [Job.id](data.md#job-id) mới được tạo.

### magic

```
GET /api/app/magic/v1/TOKEN
```

Bắt đầu một job sử dụng "Magic Link". Đây là một URL duy nhất với một token mã hóa được nhúng, được định cấu hình để kích hoạt một event cụ thể thông qua một trigger magic đặc biệt. API này không yêu cầu phiên người dùng hoặc API Key -- xác thực được xây dựng ngay vào URL. Bất kỳ tham số nào được truyền cho API, qua tham số chuỗi truy vấn hoặc tham số POST, đều được truyền trực tiếp vào job dưới dạng các tham số event.

Bất kỳ tham số event hoặc plugin nào bị "khóa bởi quản trị viên" đều không thể bị ghi đè bởi API này.

Xem [Magic Link Trigger](triggers.md#magic-link) để biết thêm chi tiết.

Ví dụ response:

```json
{
    "code": 0,
    "id": "jabc123def",
	"stream": "38051e4e8b4edae6d705a4c8252569066f4f40d33c975bcf3c40205df87a22b9"
}
```

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một thuộc tính `id` chứa [Job.id](data.md#job-id) mới được tạo, và một "stream token" đặc biệt trong thuộc tính tên là `stream`. Token này có thể được cung cấp cho API [stream_job](#stream_job) để stream các cập nhật job thông qua [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

### form

```
GET /api/app/form/v1/TOKEN
```

API này là một phần của hệ thống [Magic Link](triggers.md#magic-link), và được thiết kế để sử dụng trong trình duyệt. Nó hiển thị một trang độc lập cung cấp cho người dùng một biểu mẫu để kích hoạt job cho event được liên kết. Nếu event chứa bất kỳ tham số nào, các trường biểu mẫu đó cũng được hiển thị. Nếu event cho phép tải lên tệp, người dùng cũng có thể làm điều đó. Khi job được bắt đầu, các cập nhật được stream trực tiếp đến trang để người dùng có thể theo dõi tiến trình job của họ. Khi job hoàn tất, trang sẽ hiển thị kết quả job, các tệp và dữ liệu đầu ra nếu có, và nội dung của người dùng nếu được cung cấp.

Xem [Magic Link Trigger](triggers.md#magic-link) để biết thêm chi tiết.

Response của API này là một bản trình bày HTML đầy đủ chứa các trường biểu mẫu tham số event để người dùng điền vào, cũng như một trường tải lên tệp nếu được event hỗ trợ. Việc gửi biểu mẫu sẽ kích hoạt một lệnh gọi tới [magic](#magic), theo sau là một lệnh gọi tới [stream_job](#stream_job) để stream các cập nhật job theo thời gian thực đến trang đích.

**Lưu ý**: Việc tải lên tệp được các event hỗ trợ theo mặc định, trừ khi bạn thêm [Giới hạn tệp tối đa](limits.md#max-file-limit). Thiết lập lượng giới hạn bằng `0` sẽ vô hiệu hóa hoàn toàn việc tải lên tệp.

## Files

Các API tệp sẽ tải lên các tệp người dùng, đính kèm tệp vào các job đang chạy, tải lên các tệp đầu vào của job trước khi khởi chạy, phục vụ tệp và xóa tệp được liên kết với một job. Các endpoint này được thiết kế cho cả việc tải lên từ trình duyệt và sử dụng qua lập trình; hầu hết chỉ yêu cầu một phiên hợp lệ hoặc API Key, trong khi các thao tác cụ thể cho job có thể yêu cầu các đặc quyền bổ sung.

### upload_files

```
POST /api/app/upload_files/v1
```

Tải lên một hoặc nhiều tệp cho người dùng đã xác thực. Đây là một endpoint tải lên có mục đích chung (không gắn với bất kỳ job cụ thể nào). Yêu cầu một phiên người dùng hoặc API Key hợp lệ. Sử dụng `multipart/form-data` với một hoặc nhiều trường tệp.

Ghi chú:

- Các tệp được lưu trữ dưới một đường dẫn cụ thể của người dùng và tự động hết hạn theo cấu hình server (xem [file_expiration](config.md#file_expiration)).
- Tất cả các đường dẫn tệp sẽ chứa một mã băm mật mã duy nhất, làm cho các URL không thể bị phát hiện.
- API này được thư viện vẽ biểu đồ sử dụng để cung cấp các liên kết đến các hình ảnh snapshot của biểu đồ.
- Tên trường POST HTTP là tùy ý; tất cả các tệp trong request đều được xử lý.

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một mảng `urls` chứa các URL tuyệt đối cho các tệp đã tải lên.

Ví dụ response:

```json
{
    "code": 0,
    "urls": [
        "https://example.xyops.io/files/admin/vphJjp2KSaqleXhZog1P2w57bl3DSjGW2kPeOS_7mpc/report.csv"
    ]
}
```

### upload_job_file

```
POST /api/app/upload_job_file/v1
```

Tải lên một tệp và liên kết nó với một job đang chạy. Endpoint này chủ yếu được tác nhân vệ tinh (xySat) sử dụng, và không được thiết kế cho mục đích sử dụng bên ngoài. Yêu cầu xác thực thông qua một trong ba phương thức bên dưới và `multipart/form-data` với một trường tệp duy nhất tên là `file1`.

Các phương thức xác thực:

- API Key: Cung cấp API Key hợp lệ thông qua các cơ chế tiêu chuẩn (ví dụ: header `X-API-Key` hoặc tham số `api_key`). Để thuận tiện, bạn cũng có thể truyền nó trong tham số `auth`.
- Token server: Cung cấp `server` (ID của Server) và `auth` (một token server). Vệ tinh tính toán token này; nó được xác minh bởi server chính.
- Token job: Cung cấp `auth` được tính toán cho job. Vệ tinh tính toán token này; nó được xác minh bởi server chính.

Các tham số (form + query):

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id) đang chạy. |
| `auth` | String | **(Bắt buộc)** Token xác thực hoặc API Key (xem bên trên). |
| `server` | String | Tùy chọn. Chỉ bắt buộc đối với phương thức token server. |
| `file1` | File | **(Bắt buộc)** Nội dung tệp được tải lên (tên trường multipart phải là `file1`). |

Ví dụ request multipart (mã giả):

```
POST /api/app/upload_job_file/v1?id=jabc123def&auth=...&server=main
Content-Type: multipart/form-data; boundary=----XYZ

------XYZ
Content-Disposition: form-data; name="file1"; filename="log.txt"
Content-Type: text/plain

hello
------XYZ--
```

Ví dụ response:

```json
{
    "code": 0,
    "key": "files/jobs/jabc123def/Y2Jh.../log.txt",
    "size": 5338
}
```

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một `key` (đường dẫn lưu trữ) và `size` (byte). Bạn có thể tìm nạp tệp sau đó bằng `GET /{key}` tương đối so với URL cơ sở của bạn (xem [file](#file)).

### delete_job_file

```
POST /api/app/delete_job_file/v1
```

Xóa một tệp đã được đính kèm trước đó vào một job. Yêu cầu một phiên hợp lệ hoặc API Key với quyền [delete_jobs](privileges.md#delete_jobs), và quyền truy cập category/target vào event của job. Hỗ trợ HTTP POST với JSON, hoặc HTTP GET với các tham số truy vấn.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `path` | String | **(Bắt buộc)** Đường dẫn lưu trữ chính xác của tệp cần xóa. Phải là một tệp được đính kèm vào job được chỉ định. |

Ví dụ request:

```json
{
    "id": "jabc123def",
    "path": "files/jobs/jabc123def/Y2Jh.../log.txt"
}
```

Ví dụ response:

```json
{
    "code": 0
}
```

Tệp sẽ bị xóa khỏi bộ nhớ và danh sách `files` của job. Để làm rõ, API này không cho phép xóa tệp với bất kỳ đường dẫn lưu trữ ngẫu nhiên nào. Tham số `path` được chỉ định phải được đăng ký dưới dạng một tệp trong đối tượng job được cung cấp, nếu không API sẽ trả về lỗi.

### upload_job_input_files

```
POST /api/app/upload_job_input_files/v1
```

Tải lên một hoặc nhiều tệp dự kiến làm đầu vào cho một job trước khi nó bắt đầu (ví dụ: từ hộp thoại Run Event). Yêu cầu một phiên hợp lệ hoặc API Key với quyền [run_jobs](privileges.md#run_jobs). Sử dụng `multipart/form-data` với một hoặc nhiều trường tệp.

Ghi chú:

- Các tệp tự động hết hạn theo cấu hình [client.job_upload_settings.user_file_expiration](config.md#client-job_upload_settings) trên server.
- Response cung cấp siêu dữ liệu có thể được cung cấp cho `run_event` dưới mục `input.files`.

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một mảng `files` với siêu dữ liệu cho mỗi tệp đã tải lên.

Ví dụ response:

```json
{
    "code": 0,
    "files": [
        {
            "id": "fme4wijr73h",
            "date": 1754783040,
            "filename": "input.csv",
            "path": "files/admin/bdY8zZ9nKynfFUb4xH6fA/input.csv",
            "size": 92615,
            "username": "admin"
        }
        
    ]
}
```

Xem [Job.files](data.md#job-files) để biết cách các tệp này được sử dụng bởi các job.

### file

```
GET /files/...
GET /api/app/file/v1?path=...
```

Phục vụ một tệp từ bộ nhớ. Đây là một endpoint nhị phân/stream (không phải JSON). Nó hỗ trợ toàn bộ GET, HEAD, các request có điều kiện thông qua `ETag` và `If-Modified-Since`, và các request HTTP Range cho nội dung một phần. Bạn có thể truy cập các tệp bằng đường dẫn trực tiếp dưới `/files/...`, hoặc thông qua `GET /api/app/file/v1?path=...`.

Các tham số (truy vấn):

| Property Name | Type | Description |
|---------------|------|-------------|
| `path` | String | Khi sử dụng `/api/app/file/v1`, đường dẫn lưu trữ tương đối dưới `files/` để phục vụ. |
| `download` | String | Tùy chọn. Nếu được đặt, buộc phải tải xuống. Sử dụng `1` để tải xuống với tên tệp gốc, hoặc cung cấp tên tệp tùy chỉnh. |

Hành vi:

- Khi loại nội dung là hoặc có chứa `text/html`, việc tải xuống bị bắt buộc trừ khi `download` được chỉ định, để ngăn chặn việc hiển thị HTML trong trình duyệt.
- Các request Range trả về `206 Partial Content` với các header `Content-Range` và `Content-Length`.
- Các request HEAD chỉ trả về các header, và có thể trả về `304 Not Modified` nếu có thể áp dụng.

Ví dụ:

- URL trực tiếp: `GET https://example.xyops.io/files/admin/report.csv`
- Định dạng API: `GET https://example.xyops.io/api/app/file/v1?path=admin/report.csv&download=1`



## Groups

Các API group quản lý các server group được sử dụng để tổ chức cơ sở hạ tầng, định tuyến các job, nhắm mục tiêu các plugin monitor, và kiểm soát truy cập. Sử dụng chúng để liệt kê, lấy, tạo, cập nhật và xóa các group. Các group ảnh hưởng đến nơi các job và monitor chạy, và là yếu tố để áp dụng các hạn chế truy cập của người dùng cũng như bộ lọc tìm kiếm. Chỉnh sửa group yêu cầu có quyền; đọc yêu cầu phiên hợp lệ hoặc API Key.

### get_groups

```
GET /api/app/get_groups/v1
```

Tìm nạp tất cả các server group. Không yêu cầu tham số đầu vào nào. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hoặc API Key hợp lệ.

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa tất cả các group, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng không có phân trang).

Ví dụ response:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "main",
            "title": "Main Group",
            "hostname_match": ".+",
            "sort_order": 0,
            "username": "admin",
            "modified": 1754365754,
            "created": 1754365754,
            "revision": 1
        }
        
    ],
    "list": { "length": 1 }
}
```

Xem [Group](data.md#group) để biết chi tiết về các thuộc tính của group.

### get_group

```
GET /api/app/get_group/v1
```

Tìm nạp định nghĩa một group duy nhất theo ID. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hoặc API Key hợp lệ. Cả HTTP GET với các tham số chuỗi truy vấn và HTTP POST với JSON đều được chấp nhận.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của group cần tìm nạp. |

Ví dụ request:

```json
{
    "id": "main"
}
```

Ví dụ response:

```json
{
    "code": 0,
    "group": {
        "id": "main",
        "title": "Main Group",
        "hostname_match": ".+",
        "sort_order": 0,
        "username": "admin",
        "modified": 1754365754,
        "created": 1754365754,
        "revision": 1
    }
}
```

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `group` chứa group được yêu cầu.

Xem [Group](data.md#group) để biết chi tiết về các thuộc tính của group.

### create_group

```
POST /api/app/create_group/v1
```

Tạo một server group mới. Yêu cầu quyền [create_groups](privileges.md#create_groups) và quyền truy cập cấp group vào ID được chỉ định, cộng với một phiên người dùng hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. Xem [Group](data.md#group) để biết chi tiết về thuộc tính. Thuộc tính `id` có thể bị bỏ qua và sẽ được tạo tự động; `username`, `created`, `modified`, `revision`, và `sort_order` do server thiết lập.

Các tham số (trường bắt buộc):

| Property Name | Type | Description |
|---------------|------|-------------|
| `title` | String | **(Bắt buộc)** Tên hiển thị của group. |
| `hostname_match` | String | **(Bắt buộc)** Một chuỗi biểu thức chính quy được sử dụng để tự động khớp các server với group. |
| (Other) | Various | Bất kỳ trường [Group](data.md#group) nào khác (ví dụ: `title`, `hostname_match`, `icon`, `notes`, `alert_actions`). |

Ví dụ request:

```json
{
    "title": "Main Group",
    "hostname_match": ".+",
    "notes": "Primary workers"
}
```

Ví dụ response:

```json
{
    "code": 0,
    "group": { /* full group object including auto-generated fields */ }
}
```

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `group` chứa group mới được tạo.

Ghi chú:

- Các alert action của group sẽ được xác thực (xem [Action](data.md#action)) thông qua `alert_actions`.
- `sort_order` được tự động chỉ định ở cuối danh sách hiện tại.

### update_group

```
POST /api/app/update_group/v1
```

Cập nhật một group đã có theo ID. Yêu cầu quyền [edit_groups](privileges.md#edit_groups) và quyền truy cập cấp group vào ID được chỉ định, cộng với một phiên người dùng hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. Request sẽ được hợp nhất nông vào group hiện có, vì vậy bạn có thể cung cấp một tập hợp thưa thớt các thuộc tính cần cập nhật. Server tự động cập nhật `modified` và tăng `revision`.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID group cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Group](data.md#group) nào có thể cập nhật (ví dụ: `title`, `hostname_match`, `icon`, `notes`, `alert_actions`). |

Ví dụ request:

```json
{
    "id": "main",
    "title": "Main Group (prod)",
    "hostname_match": "^prod-\\w+$"
}
```

Ví dụ response:

```json
{
    "code": 0
}
```

### delete_group

```
POST /api/app/delete_group/v1
```

Xóa một group đã có theo ID. Yêu cầu quyền [delete_groups](privileges.md#delete_groups) và quyền truy cập cấp group vào ID được chỉ định, cộng với một phiên người dùng hoặc API Key hợp lệ.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID group cần xóa. |

Ví dụ request:

```json
{
    "id": "main"
}
```

Ví dụ response:

```json
{
    "code": 0
}
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### multi_update_group

```
POST /api/app/multi_update_group/v1
```

Cập nhật nhiều group trong một lệnh gọi duy nhất. Endpoint này chỉ dành cho việc cập nhật `sort_order` (ví dụ: sau khi kéo thả sắp xếp lại trong giao diện người dùng). Yêu cầu quyền [edit_groups](privileges.md#edit_groups) và quyền truy cập cấp group vào tất cả các group (`*`), cộng với một phiên người dùng hoặc API Key hợp lệ.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `items` | Array(Object) | **(Bắt buộc)** Mảng các đối tượng, mỗi đối tượng có `id` và `sort_order` mới. |

Ví dụ request:

```json
{
    "items": [
        { "id": "main",   "sort_order": 0 },
        { "id": "staging", "sort_order": 1 }
    ]
}
```

Ví dụ response:

```json
{
    "code": 0
}
```

Ghi chú:

- Chỉ `sort_order` được cập nhật bởi endpoint này.
- `modified` và `revision` không được cập nhật theo thiết kế đối với thao tác multi-update cho thứ tự sắp xếp.

### watch_group

```
POST /api/app/watch_group/v1
```

Bắt đầu hoặc dừng việc theo dõi một group, việc này sẽ chụp snapshot một lần mỗi phút trong khoảng thời gian được chỉ định. Yêu cầu quyền [create_snapshots](privileges.md#create_snapshots) và một phiên người dùng hoặc API Key hợp lệ. Hỗ trợ HTTP POST với JSON, hoặc HTTP GET với các tham số truy vấn.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID group cần theo dõi. |
| `duration` | Number | **(Bắt buộc)** Khoảng thời gian tính bằng giây. Đặt thành `0` để hủy một lượt theo dõi hiện tại. |

Ví dụ request:

```json
{
    "id": "main",
    "duration": 3600
}
```

Ví dụ response:

```json
{
    "code": 0
}
```

Xem [Snapshots](snapshots.md) để biết thêm chi tiết.

### create_group_snapshot

```
POST /api/app/create_group_snapshot/v1
```

Tạo một snapshot cho group được chỉ định bằng cách sử dụng dữ liệu server gần đây nhất. Yêu cầu quyền [create_snapshots](privileges.md#create_snapshots) và một phiên người dùng hoặc API Key hợp lệ. Hỗ trợ HTTP POST với JSON, hoặc HTTP GET với các tham số truy vấn.

Các tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `group` | String | **(Bắt buộc)** ID group mà snapshot sẽ được tạo. |

Ví dụ request:

```json
{
    "group": "main"
}
```

Ví dụ response:

```json
{
    "code": 0,
    "id": "snmhr6zkefh1"
}
```

Ngoài [Định dạng Response Tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một thuộc tính `id` chứa [GroupSnapshot.id](data.md#groupsnapshot-id) mới.

Xem [Snapshots](snapshots.md) để biết thêm chi tiết.

## Jobs

Job API cung cấp khả năng quan sát và kiểm soát quá trình thực thi job. Sử dụng chúng để tìm kiếm, lấy thông tin chi tiết, theo dõi tiến độ, phát trực tuyến (stream) hoặc tải xuống log/file và quản lý vòng đời (ví dụ: hủy bỏ). Các job được tạo bằng cách chạy event hoặc workflow; dữ liệu job bao gồm parameter, đầu vào (dữ liệu/file), đầu ra và mã kết quả. Quyền truy cập bị giới hạn bởi quyền của category/group và đặc quyền của từng job.

### get_active_jobs

```
GET /api/app/get_active_jobs/v1
```

Lấy các job đang hoạt động (active job) với bộ lọc, phân trang và sắp xếp tùy chọn. Active job bao gồm các trạng thái như `queued`, `ready`, `active` và `finishing`. Yêu cầu phiên người dùng hoặc API Key hợp lệ.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `offset` | Number | Tùy chọn row offset. Mặc định là `0`. |
| `limit` | Number | Tùy chọn row limit. Mặc định là tất cả các hàng phù hợp. |
| `sort_by` | String | Tùy chọn trường sắp xếp. Mặc định là `started`. |
| `sort_dir` | Number | Tùy chọn hướng sắp xếp. Sử dụng `-1` cho giảm dần (mặc định) hoặc `1` cho tăng dần. |
| other filters | Various | Tùy chọn bộ lọc thuộc tính job (ví dụ: `state`, `event`, `server`, `workflow.job`). |

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một mảng `rows` chứa các active job phù hợp và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không cần phân trang).

Ví dụ phản hồi:

```json
{
    "code": 0,
    "rows": [ { /* Job */ } ],
    "list": { "length": 1 }
}
```

Xem [Job](data.md#job) để biết các thuộc tính của job.

### get_active_job_summary

```
GET /api/app/get_active_job_summary/v1
```

Tóm tắt các active job theo event, được nhóm theo trạng thái, nguồn và mục tiêu. Chấp nhận các bộ lọc tùy chọn giống như [get_active_jobs](#get_active_jobs). Yêu cầu phiên người dùng hoặc API Key hợp lệ.

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một đối tượng `events` được khóa bằng [Event.id](data.md#event-id), mỗi đối tượng chứa các bộ đếm `states`, `sources` và `targets`.

Ví dụ phản hồi:

```json
{
    "code": 0,
    "events": {
        "event100": {
            "id": "event100",
            "states": { "queued": 2, "active": 1 },
            "sources": { "user": 1, "scheduler": 2 },
            "targets": { "main": 3 }
        }
    }
}
```

### get_workflow_job_summary

```
GET /api/app/get_workflow_job_summary/v1
```

Tóm tắt các workflow job theo node cho một bối cảnh workflow nhất định (ví dụ: một workflow job cấp cao nhất cụ thể). Chấp nhận các bộ lọc tùy chọn giống như [get_active_jobs](#get_active_jobs). Yêu cầu phiên người dùng hoặc API Key hợp lệ.

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một đối tượng `nodes` được khóa bằng workflow node ID với số lượng các active job phù hợp trên mỗi node.

Ví dụ phản hồi:

```json
{
    "code": 0,
    "nodes": { "nmhr8zbgjiv": 3, "nmhr8zjdtiw": 1 }
}
```

API này được sử dụng trong giao diện người dùng để tóm tắt (đếm) các job đã xếp hàng (queued) trên mỗi workflow node.

### get_job

```
GET /api/app/get_job/v1
```

Lấy thông tin chi tiết của một job duy nhất, đang chạy hoặc đã hoàn thành. Yêu cầu phiên người dùng hoặc API Key hợp lệ, và quyền truy cập category/target vào event của job. Cả HTTP GET với parameter chuỗi truy vấn (query string) và HTTP POST với JSON đều được chấp nhận.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id) cần lấy. |
| `remove` | Array | Mảng tùy chọn các tên thuộc tính để loại trừ khỏi đối tượng job được trả về (ví dụ: các trường nặng). |

Ví dụ request:

```json
{ "id": "jabc123def" }
```

Ví dụ phản hồi:

```json
{
    "code": 0,
    "token": "Zy8...",
    "job": { /* Job object */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một đối tượng `job` chứa job được yêu cầu và một chuỗi `token` được sử dụng để xem/tải xuống job log (xem [view_job_log](#view_job_log) và [download_job_log](#download_job_log)).

Xem [Job](data.md#job) để biết chi tiết về đối tượng job.

### get_jobs

```
POST /api/app/get_jobs/v1
```

Lấy nhiều job (đang chạy hoặc đã hoàn thành) theo ID. Yêu cầu phiên người dùng hoặc API Key hợp lệ.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `ids` | Array(String) | **(Bắt buộc)** Mảng các giá trị [Job.id](data.md#job-id). |
| `verbose` | Boolean | Tùy chọn. Nếu `true`, bao gồm các trường nặng; nếu không chúng sẽ bị cắt bỏ. |

Ví dụ request:

```json
{
    "ids": ["jabc123def", "jdef456ghi"],
    "verbose": false
}
```

Ví dụ phản hồi:

```json
{
    "code": 0,
    "jobs": [
        { /* Job 1 (pruned by default) */ },
        { /* Job 2 (pruned by default) */ }
    ]
}
```

Ghi chú:

- Khi `verbose` không được đặt, các trường nặng sau đây sẽ bị loại bỏ: `actions`, `activity`, `html`, `limits`, `procs`, `conns`, `table`, `timelines`, `input`, `data`, `files`.
- Xem [Job](data.md#job) để biết chi tiết về đối tượng job.

### get_job_log

```
GET /api/app/get_job_log/v1
```

Phát trực tuyến (stream) job log dưới dạng văn bản thuần túy (plain text). Yêu cầu phiên người dùng hợp lệ (xác thực phiên).

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |

Phản hồi:

- Trả về HTTP `200 OK` với `Content-Type: text/plain; charset=utf-8`. Đối với các log đã lưu trữ, nó có thể bao gồm `Content-Encoding: gzip`.
- Trả về `204 No Content` nếu không có log nào.

### view_job_log

```
GET /api/app/view_job_log/v1?id=JOB_ID&t=TOKEN
```

Xem job log (văn bản thuần túy) thông qua xác thực token. Điều này hữu ích cho các liên kết có thể chia sẻ. Lấy token `t` từ phản hồi của [get_job](#get_job).

Parameter (truy vấn):

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `t` | String | **(Bắt buộc)** Token tải xuống từ [get_job](#get_job). |

Phản hồi:

- Trả về HTTP `200 OK` với `Content-Type: text/plain; charset=utf-8`. Đối với các log đã lưu trữ, nó có thể bao gồm `Content-Encoding: gzip`.
- Trả về `404 Not Found` nếu không có log nào, hoặc `403 Forbidden` nếu token không hợp lệ.

### download_job_log

```
GET /api/app/download_job_log/v1?id=JOB_ID&t=TOKEN
```

Tải xuống job log dưới dạng file thông qua xác thực token. Lấy token `t` từ phản hồi của [get_job](#get_job).

Parameter (truy vấn):

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `t` | String | **(Bắt buộc)** Token tải xuống từ [get_job](#get_job). |

Phản hồi:

- Trả về HTTP `200 OK` với `Content-Type: text/plain; charset=utf-8` và `Content-Disposition` đề xuất tên file. Đối với log đã lưu trữ, nó có thể bao gồm `Content-Encoding: gzip`.
- Trả về `404 Not Found` nếu không có log nào, hoặc `403 Forbidden` nếu token không hợp lệ.

### tail_live_job_log

```
GET /api/app/tail_live_job_log/v1
```

Trả về phần cuối (tail chunk) của job log đang chạy (căn chỉnh cuối ~32KB) để chuẩn bị cho trình xem log thời gian thực. Yêu cầu phiên người dùng hoặc API Key hợp lệ, và job phải đang active.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `bytes` | Number | Tùy chọn. Số byte gần đúng để trả về từ cuối. Mặc định là `32678` (32K). |

Ví dụ phản hồi:

```json
{
    "code": 0,
    "text": "...last lines of log..."
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một chuỗi `text` chứa phần cuối của log đang trực tiếp (live log). Nếu job không active, `text` sẽ rỗng.

### stream_job

```
GET /api/app/stream_job/v1
```

Phát trực tuyến các bản cập nhật job trực tiếp thông qua [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `token` | String | Optional | Token xác thực đặc biệt được sử dụng bởi API [magic](#magic) để stream job cho các magic landing page. |

Phản hồi sẽ được phát trực tuyến bằng [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events). Bản cập nhật đầu tiên sẽ bao gồm một tài liệu JSON chứa [Job.id](data.md#job.id), tiếp theo là nhiều bản cập nhật khi job chạy, với một bản cập nhật cuối cùng khi job hoàn thành. Dưới đây là ví dụ về phản hồi phát trực tuyến thô (nhiều bản cập nhật trung gian được bỏ qua cho ngắn gọn):

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Date: Mon, 22 Dec 2025 04:53:01 GMT
Connection: keep-alive
Keep-Alive: timeout=30
Transfer-Encoding: chunked

event: start
data: {}

event: update
data: {"xy":1,"id":"jmjgok2xeb5ufrcl","started":1766379181.011,"state":"ready","progress":0}

event: update
data: {"xy":1,"cpu":{"min":3.3,"max":50,"total":129.7,"count":12,"current":3.3},"mem":{"min":32239616,"max":59838464,"total":680706048,"count":12,"current":55287808},"updated":1766379192.219,"progress":0.33113333384195964}

event: update
data: {"xy":1,"cpu":{"min":1.8,"max":50,"total":152.85,"count":22,"current":1.8},"mem":{"min":32239616,"max":59838464,"total":1234894848,"count":22,"current":55418880},"updated":1766379202.164,"progress":0.6665666659673055}

event: update
data: {"xy":1,"id":"jmjgok2xeb5ufrcl","code":0,"description":"Success!","completed":1766379212.239,"elapsed":31.2260000705719,"data":{"text":"This is some sample data to pass to the next job!","hostname":"raspberrypi","pid":2954920,"random":0.54,"obj":{"foo":1,"bar":null,"bool":true},"custom":""},"files":[]}

event: end
data: {}
```

Luồng (stream) sẽ luôn bắt đầu với một sự kiện `start` và một bản ghi dữ liệu rỗng.

Các bản cập nhật trung gian bao gồm các thuộc tính job có liên quan thường xuyên thay đổi hoặc đã được cập nhật (ví dụ: [Job.progress](data.md#job-progress), [Job.cpu](data.md#job-cpu), [Job.mem](data.md#job-mem), v.v.). Bản cập nhật cuối cùng được gửi sau khi job hoàn thành và nó bao gồm các thuộc tính như [Job.code](data.md#job-code), [Job.description](data.md#job-description) và [Job.elapsed](data.md#job-elapsed). Nó cũng bao gồm đầu ra của job [Job.data](data.md#job-data) và [Job.files](data.md#job-files) nếu có.

Sau khi tất cả các bản cập nhật hoàn tất, một sự kiện `end` cuối cùng sẽ được gửi (với một bản ghi dữ liệu rỗng).

### update_job

```
POST /api/app/update_job/v1
```

Chỉ dành cho Admin. Cập nhật một job đang chạy hoặc đã hoàn thành. Đây là một API mạnh mẽ dành cho các chỉnh sửa quản trị và cập nhật siêu dữ liệu. Yêu cầu đặc quyền [admin](privileges.md#admin).

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| (Other) | Various | Bất kỳ trường job nào có thể ghi để cập nhật. Các job đang chạy được cập nhật trong bộ nhớ (in-memory); các job đã hoàn thành được cập nhật trong bộ lưu trữ. |

Ví dụ phản hồi:

```json
{ "code": 0 }
```

Sử dụng cẩn thận. Điều này có thể làm thay đổi lịch sử job đã được lưu trữ.

### resume_job

```
POST /api/app/resume_job/v1
```

Tiếp tục (resume) một active job đang bị treo (suspended). Yêu cầu đặc quyền [run_jobs](privileges.md#run_jobs) và phiên người dùng hoặc API Key hợp lệ, cộng với quyền truy cập category/target vào event của job. Job phải đang active và hiện đang bị treo.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `params` | Object | Tùy chọn. Các parameter người dùng để hợp nhất vào `params` của job khi tiếp tục. |
| `redirect` | String | Tùy chọn. Đối với workflow sub-job đang bị treo, hãy đặt giá trị này thành workflow Event hoặc Job [Node ID](data.md#workflownode-id) để chuyển đến sau khi quá trình tiếp tục được xử lý. |

Hành vi:

- Thất bại nếu job không active hoặc không bị treo.
- Ghi lại siêu dữ liệu treo (thời lượng, tiếp tục lúc/bởi, IP, user agent) trong chi tiết hành động suspend của job để kiểm toán.
- Nếu được cung cấp, hợp nhất các `params` vào các parameter job hiện tại khi tiếp tục. Tính năng này được sử dụng để thu thập các parameter của người dùng trong giao diện người dùng vào thời điểm tiếp tục.
- Nếu được cung cấp, `redirect` sẽ tùy chỉnh bước tiếp theo của workflow cha sau khi sub-job tiếp tục. Thay vì đi theo các dây đầu ra phù hợp thông thường từ node bị treo, workflow sẽ khởi chạy trực tiếp Event hoặc Job node đã chọn.
- Giao diện người dùng chỉ hiển thị bộ chọn chuyển hướng (redirect) tiếp tục khi tiếp tục một workflow sub-job bị treo khi kết thúc job, chẳng hạn như từ một `On Complete`, `On Success`, `On Any Error` hoặc các hành động của tag. Nó không được hiển thị cho các job bị treo khi bắt đầu job, chẳng hạn như từ hành động `On Start`.

Ví dụ request:

```json
{
    "id": "jabc123def",
    "params": { "example": 12345 },
    "redirect": "node123"
}
```

Ví dụ phản hồi:

```json
{ "code": 0 }
```

### job_skip_delay

```
POST /api/app/job_skip_delay/v1
```

Bỏ qua khoảng thời gian trễ hiện tại đối với một active job. Yêu cầu đặc quyền [run_jobs](privileges.md#run_jobs) và phiên người dùng hoặc API Key hợp lệ, cộng với quyền truy cập category/target vào event của job. Job phải đang active và hiện đang chờ ở trạng thái trễ (delay state), chẳng hạn như `start_delay` hoặc `retry_delay`.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |

Ví dụ request:

```json
{
	"id": "jabc123def"
}
```

Ví dụ phản hồi:

```json
{ "code": 0 }
```

Hành vi:

- Thất bại nếu job không active.
- Thất bại nếu job hiện không phải đang chờ trễ.
- Ghi lại một mục meta log trên job lưu ý rằng thời gian trễ đã được bỏ qua thủ công.
- Thời hạn trễ của job được chuyển đến thời điểm hiện tại, cho phép việc lập lịch trình bình thường tiếp tục ngay lập tức.

### job_toggle_notify_me

```
POST /api/app/job_toggle_notify_me/v1
```

Bật/tắt email thông báo hoàn thành cho người dùng hiện tại trên một active job. Yêu cầu phiên người dùng hợp lệ (có thiết lập địa chỉ email).

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |

Ví dụ phản hồi:

```json
{
    "code": 0,
    "enabled": true
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một boolean `enabled` cho biết trạng thái bật/tắt (toggle) mới.

### manage_job_tags

```
POST /api/app/manage_job_tags/v1
```

Thay thế các tag trên một job đã hoàn thành. Yêu cầu đặc quyền [tag_jobs](privileges.md#tag_jobs) và phiên hoặc API Key hợp lệ. Không thể được sử dụng trên các job đang chạy.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |
| `tags` | Array(String) | **(Bắt buộc)** Danh sách thay thế đầy đủ các tag cho job. |

Ví dụ request:

```json
{
    "id": "jabc123def",
    "tags": ["ops", "nightly"]
}
```

Ví dụ phản hồi:

```json
{ "code": 0 }
```

Ghi chú:

- Nhật ký activity của job được nối thêm phần tóm tắt các thay đổi tag.

### abort_job

```
POST /api/app/abort_job/v1
```

Hủy bỏ một job đang chạy. Yêu cầu đặc quyền [abort_jobs](privileges.md#abort_jobs) và phiên người dùng hoặc API Key hợp lệ, cộng với quyền truy cập category/target vào event của job.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |

Ví dụ phản hồi:

```json
{ "code": 0 }
```

### delete_job

```
POST /api/app/delete_job/v1
```

Xóa một job đã hoàn thành, bao gồm log và file. Yêu cầu đặc quyền [delete_jobs](privileges.md#delete_jobs) và phiên hoặc API Key hợp lệ, cộng với quyền truy cập category/target. Không thể xóa các active job.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Job.id](data.md#job-id). |

Ví dụ phản hồi:

```json
{ "code": 0 }
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### flush_event_queue

```
POST /api/app/flush_event_queue/v1
```

Xóa (flush) tất cả các job đang xếp hàng đợi (queued) cho một event mà không kích hoạt các hành động hoàn thành. Yêu cầu đặc quyền [abort_jobs](privileges.md#abort_jobs) và phiên người dùng hoặc API Key hợp lệ.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Event.id](data.md#event-id) có hàng đợi cần xóa (flush). |

Ví dụ phản hồi:

```json
{
    "code": 0,
    "count": 3
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một thuộc tính `count` cho biết có bao nhiêu queued job đã bị xóa.



## Monitors

Monitor API quản lý các định nghĩa về bộ thu thập số liệu (metrics) phía server và định dạng đầu ra của chúng. Sử dụng chúng để liệt kê, lấy dữ liệu, tạo, cập nhật và xóa monitor. Các monitor chạy thông qua các agent trên server (xySat) và cung cấp dữ liệu chuỗi thời gian (time-series) cùng với các alert. Việc đọc dữ liệu monitor yêu cầu phiên hoặc API Key hợp lệ; việc chỉnh sửa định nghĩa yêu cầu các đặc quyền.

### get_monitors

```
GET /api/app/get_monitors/v1
```

Lấy tất cả các định nghĩa monitor. Không cần parameter đầu vào. Không yêu cầu đặc quyền cụ thể nào ngoài phiên người dùng hoặc API Key hợp lệ.

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một mảng `rows` chứa tất cả các monitor và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không cần phân trang).

Ví dụ phản hồi:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "cpu_usage",
            "title": "CPU Usage %",
            "source": "cpu.currentLoad",
            "data_type": "float",
            "suffix": "%",
            "groups": [],
            "display": true,
            "min_vert_scale": 100,
            "sort_order": 1,
            "username": "admin",
            "modified": 1754365754,
            "created": 1754365754,
            "revision": 1
        }
        
    ],
    "list": { "length": 1 }
}
```

Xem [Monitor](data.md#monitor) để biết chi tiết về các thuộc tính của monitor.

### get_monitor

```
GET /api/app/get_monitor/v1
```

Lấy một định nghĩa monitor duy nhất theo ID. Không yêu cầu đặc quyền cụ thể nào ngoài phiên người dùng hoặc API Key hợp lệ. HTTP POST với JSON cũng được chấp nhận.

Parameter:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của monitor cần lấy. |

Ví dụ phản hồi:

```json
{
    "code": 0,
    "monitor": {
        "id": "cpu_usage",
        "title": "CPU Usage %",
        "source": "cpu.currentLoad",
        "data_type": "float",
        "suffix": "%",
        "groups": [],
        "display": true,
        "min_vert_scale": 100,
        "sort_order": 1,
        "username": "admin",
        "modified": 1754365754,
        "created": 1754365754,
        "revision": 1
    }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một đối tượng `monitor` chứa monitor được yêu cầu.

Xem [Monitor](data.md#monitor) để biết chi tiết về các thuộc tính của monitor.
### create_monitor

```
POST /api/app/create_monitor/v1
```

Tạo một monitor mới. Yêu cầu quyền [create_monitors](privileges.md#create_monitors) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. Xem [Monitor](data.md#monitor) để biết chi tiết thuộc tính. Có thể bỏ qua `id` và nó sẽ được tự động tạo; `username`, `created`, `modified`, `revision`, và `sort_order` được thiết lập bởi server.

Xác thực và hành vi:

- Biểu thức `source` được xác thực; lỗi cú pháp bị từ chối.
- Nếu `data_match` được cung cấp, nó phải được biên dịch thành một biểu thức chính quy hợp lệ.
- `sort_order` được tự động gán ở cuối danh sách hiện tại.

Ví dụ request:

```json
{
    "title": "CPU Usage %",
    "source": "cpu.currentLoad",
    "data_type": "float",
    "suffix": "%",
    "display": true,
    "min_vert_scale": 100,
    "groups": []
}
```

Ví dụ response:

```json
{
    "code": 0,
    "monitor": { /* full monitor object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một đối tượng `monitor` chứa monitor mới được tạo.

### update_monitor

```
POST /api/app/update_monitor/v1
```

Cập nhật một monitor hiện có bằng ID. Yêu cầu quyền [edit_monitors](privileges.md#edit_monitors) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. Request được gộp nông (shallow-merged) vào monitor hiện tại, vì vậy bạn có thể cung cấp một tập hợp thưa thớt (sparse set) các thuộc tính để cập nhật. Server cập nhật `modified` và tăng `revision` tự động.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của monitor để cập nhật. |
| (Other) | Various | Bất kỳ trường [Monitor](data.md#monitor) nào có thể cập nhật (ví dụ: `title`, `source`, `data_type`, `suffix`, `display`, `min_vert_scale`, `groups`, `icon`, `notes`). |

Xác thực và hành vi:

- Nếu `source` được bao gồm, nó sẽ được xác thực; lỗi cú pháp bị từ chối.
- Nếu `data_match` được bao gồm, nó phải được biên dịch thành một biểu thức chính quy hợp lệ.

Ví dụ response:

```json
{ "code": 0 }
```

### test_monitor

```
POST /api/app/test_monitor/v1
```

Kiểm tra cấu hình monitor (biểu thức và `data_match` tùy chọn) đối với dữ liệu hiện tại của một server cụ thể. Yêu cầu quyền [edit_monitors](privileges.md#edit_monitors) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `server` | String | **(Bắt buộc)** [Server.id](data.md#server-id) để kiểm tra đối chiếu. |
| `source` | String | **(Bắt buộc)** Biểu thức [Monitor.source](data.md#monitor-source) để đánh giá. |
| `data_type` | String | **(Bắt buộc)** Một trong các giá trị `integer`, `float`, `bytes`, `seconds`, hoặc `milliseconds`. |
| `data_match` | String | Chuỗi biểu thức chính quy JavaScript tùy chọn để trích xuất một giá trị từ văn bản. |

Ví dụ request:

```json
{
    "server": "s12345abcde",
    "source": "cpu.currentLoad",
    "data_type": "float"
}
```

Ví dụ responses:

```json
{ "code": 0, "value": 37.5 }
```

```json
{ "code": 0, "fail": true }
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một thuộc tính `value` chứa kết quả số được tính toán, hoặc `fail: true` nếu biểu thức không thể được đánh giá.

### delete_monitor

```
POST /api/app/delete_monitor/v1
```

Xóa một monitor hiện có bằng ID. Yêu cầu quyền [delete_monitors](privileges.md#delete_monitors) và một user session hoặc API Key hợp lệ.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của monitor để xóa. |

Ví dụ response:

```json
{ "code": 0 }
```

Việc xóa là vĩnh viễn và không thể hoàn tác.

### multi_update_monitor

```
POST /api/app/multi_update_monitor/v1
```

Cập nhật nhiều monitor trong một lần gọi. Endpoint này được dự định chỉ dùng để cập nhật `sort_order` (ví dụ: sau khi sắp xếp lại bằng cách kéo và thả trong UI). Yêu cầu quyền [edit_monitors](privileges.md#edit_monitors) và một user session hoặc API Key hợp lệ.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `items` | Array(Object) | **(Bắt buộc)** Mảng các đối tượng, mỗi đối tượng có một `id` và `sort_order` mới. |

Ví dụ request:

```json
{
    "items": [
        { "id": "cpu_usage", "sort_order": 0 },
        { "id": "disk_io",   "sort_order": 1 }
    ]
}
```

Ví dụ response:

```json
{ "code": 0 }
```

Ghi chú:

- Chỉ `sort_order` được cập nhật bởi endpoint này.
- `modified` và `revision` không được cập nhật theo thiết kế cho việc cập nhật nhiều lần của thứ tự sắp xếp.

### get_quickmon_data

```
GET /api/app/get_quickmon_data/v1
```

Lấy các snapshot [QuickMonData](data.md#quickmondata) hiện tại cho các server (60 giây trước). Không yêu cầu quyền cụ thể ngoài một user session hoặc API Key hợp lệ. Hữu ích cho các bảng điều khiển (dashboards).

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `server` | String | Tùy chọn. Giới hạn kết quả ở một [Server.id](data.md#server-id) duy nhất. |
| `group` | String | Tùy chọn. Giới hạn kết quả ở các server trong một [Group.id](data.md#group-id) cụ thể. |

Ví dụ response:

```json
{
    "code": 0,
    "servers": {
        "s12345abcde": [ /* QuickMon entries */ ]
    }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một đối tượng `servers` được định danh bằng ID server, mỗi giá trị là một mảng các mục QuickMon.

Xem [QuickMon](monitors.md#quickmon) để biết thêm chi tiết về các loại monitor thời gian thực này.

### get_latest_monitor_data

```
GET /api/app/get_latest_monitor_data/v1
```

Lấy các mục timeline mới nhất cho một hệ thống (system) cụ thể trên một server, cùng với snapshot dữ liệu hiện tại của server. Yêu cầu một user session hoặc API Key hợp lệ.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `server` | String | **(Bắt buộc)** [Server.id](data.md#server-id). |
| `sys` | String | **(Bắt buộc)** ID của hệ thống timeline để truy vấn (ví dụ: `hourly`, `daily`, `monthly` hoặc `yearly`). |
| `limit` | Number | **(Bắt buộc)** Số lượng các mục timeline để trả về. |

Ví dụ response:

```json
{
    "code": 0,
    "rows": [ /* timeline entries */ ],
    "data": { /* server host data snapshot */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các mục [ServerTimelineData](data.md#servertimelinedata), và một đối tượng `data` chứa [ServerMonitorData](data.md#servermonitordata) hiện tại của server.

Xem [Monitors](monitors.md) để biết thêm chi tiết về hệ thống phụ monitoring.

### get_historical_monitor_data

```
GET /api/app/get_historical_monitor_data/v1
```

Lấy các mục timeline lịch sử cho một server cụ thể. Yêu cầu một user session hoặc API Key hợp lệ.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `server` | String | **(Bắt buộc)** [Server.id](data.md#server-id). |
| `sys` | String | **(Bắt buộc)** ID của hệ thống timeline để truy vấn (ví dụ: `hourly`, `daily`, `monthly` hoặc `yearly`). |
| `date` | Number | **(Bắt buộc)** Dấu thời gian Unix (giây) chỉ định thời điểm bắt đầu của phạm vi dữ liệu để lấy. |
| `limit` | Number | **(Bắt buộc)** Số lượng các mục timeline để trả về. |

Ví dụ response:

```json
{
    "code": 0,
    "rows": [ /* timeline entries */ ]
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các mục [ServerTimelineData](data.md#servertimelinedata) lịch sử.

Xem [Monitors](monitors.md) để biết thêm chi tiết về hệ thống phụ monitoring.



## Plugins

Các API plugin quản lý các phần mở rộng triển khai hành vi tùy chỉnh trong PTOps (trình chạy event, monitor, action, và scheduler trigger). Sử dụng chúng để liệt kê, lấy, tạo, cập nhật, và xóa các plugin. Các plugin đóng gói các tệp thực thi và tham số và có thể nhận secret; chúng được tham chiếu bởi các event và hệ thống monitor. Việc tạo/cập nhật plugin yêu cầu các quyền; việc liệt kê/lấy yêu cầu một user session hoặc API Key hợp lệ.

### get_plugins

```
GET /api/app/get_plugins/v1
```

Lấy tất cả các định nghĩa plugin. Không yêu cầu quyền cụ thể, bên cạnh một user session hoặc API Key hợp lệ.

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa tất cả các plugin, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng không có phân trang).

Ví dụ response:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "shellplug",
            "title": "Shell Script",
            "enabled": true,
            "command": "[shell-plugin]",
            "username": "admin",
            "type": "event",
            "modified": 1754365754,
            "created": 1754365754,
            "params": [
                { "id": "script", "type": "code", "title": "Script Source", "value": "#!/bin/sh\n\n# Enter your shell script code here" },
                { "id": "annotate", "type": "checkbox", "title": "Add Date/Time Stamps to Log", "value": false }
            ],
            "revision": 1
        }
    ],
    "list": { "length": 1 }
}
```

Xem [Plugin](data.md#plugin) để biết chi tiết về đối tượng plugin và tất cả các thuộc tính của nó.

### get_plugin

```
GET /api/app/get_plugin/v1
```

Lấy một định nghĩa plugin duy nhất bằng ID. Không yêu cầu quyền cụ thể, bên cạnh một user session hoặc API Key hợp lệ. Cả HTTP GET với các tham số chuỗi truy vấn và HTTP POST với JSON đều được cho phép.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của plugin để lấy. |

Ví dụ request:

```json
{ "id": "shellplug" }
```

Ví dụ response:

```json
{
    "code": 0,
    "plugin": {
        "id": "shellplug",
        "title": "Shell Script",
        "enabled": true,
        "command": "[shell-plugin]",
        "username": "admin",
        "type": "event",
        "modified": 1754365754,
        "created": 1754365754,
        "params": [
            { "id": "script", "type": "code", "title": "Script Source", "value": "#!/bin/sh\n\n# Enter your shell script code here" },
            { "id": "json", "type": "checkbox", "title": "Interpret JSON in Output", "value": false }
        ],
        "revision": 1
    }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một đối tượng `plugin` chứa plugin được yêu cầu.

Xem [Plugin](data.md#plugin) để biết chi tiết về các thuộc tính của plugin.

### create_plugin

```
POST /api/app/create_plugin/v1
```

Tạo một định nghĩa plugin mới. Yêu cầu quyền [create_plugins](privileges.md#create_plugins), cũng như một user session hoặc API Key hợp lệ. Request phải được gửi dưới dạng HTTP POST với nội dung JSON.

Xem [Plugin](data.md#plugin) để biết chi tiết về các thuộc tính đầu vào. Các thuộc tính `id`, `username`, `created`, `modified` và `revision` có thể được bỏ qua, vì chúng được tạo tự động (một `id` duy nhất sẽ được gán nếu bỏ qua, và `revision` ban đầu sẽ được đặt thành `1`). Thuộc tính `type` phải là một trong: `event`, `monitor`, `action`, hoặc `scheduler`. Nếu bạn bao gồm [Plugin.params](data.md#plugin-params), chúng phải tuân theo schema đã được tài liệu hóa và sẽ được xác thực.

Ví dụ request:

```json
{
    "title": "Shell Script",
    "enabled": true,
    "type": "event",
    "command": "[shell-plugin]",
    "params": [
        { "id": "script", "type": "code", "title": "Script Source", "value": "#!/bin/sh\n\n# Enter your shell script code here" },
        { "id": "annotate", "type": "checkbox", "title": "Add Date/Time Stamps to Log", "value": false }
    ]
}
```

Ví dụ response:

```json
{
    "code": 0,
    "plugin": { /* full plugin object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một đối tượng `plugin` chứa plugin vừa được tạo (bao gồm tất cả các thuộc tính được tạo tự động).

### update_plugin

```
POST /api/app/update_plugin/v1
```

Cập nhật một định nghĩa plugin hiện có, được chỉ định bằng ID của nó. Yêu cầu quyền [edit_plugins](privileges.md#edit_plugins), cũng như một user session hoặc API Key hợp lệ. Request phải được gửi dưới dạng HTTP POST với nội dung JSON.

Xem [Plugin](data.md#plugin) để biết chi tiết về các thuộc tính đầu vào. Request được gộp nông (shallow-merged) vào plugin hiện có, vì vậy bạn có thể cung cấp một tập hợp thưa thớt các thuộc tính để cập nhật. Dấu thời gian `modified` được cập nhật tự động, và `revision` được tăng lên.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của plugin để cập nhật. |
| (Other) | Various | Bất kỳ trường [Plugin](data.md#plugin) nào có thể cập nhật (ví dụ: `title`, `enabled`, `type`, `command`, `script`, `params`, `groups`, `format`, `uid`, `gid`, `kill`, `icon`, `notes`). |

Ví dụ request:

```json
{
    "id": "shellplug",
    "title": "Shell Script (Updated)",
    "enabled": false
}
```

Ví dụ response:

```json
{ "code": 0 }
```

Ví dụ trên sẽ cập nhật các thuộc tính `title` và `enabled` của plugin với ID `shellplug`. Các thuộc tính khác sẽ không bị chạm tới (ngoại trừ `modified` và `revision`, được cập nhật tự động).

### delete_plugin

```
POST /api/app/delete_plugin/v1
```

Xóa một định nghĩa plugin hiện có, được chỉ định bằng ID của nó. Yêu cầu quyền [delete_plugins](privileges.md#delete_plugins), cũng như một user session hoặc API Key hợp lệ. Request phải được gửi dưới dạng HTTP POST với nội dung JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của plugin để xóa. |

Ví dụ request:

```json
{ "id": "shellplug" }
```

Ví dụ response:

```json
{ "code": 0 }
```




## Roles

Các API role (vai trò) định nghĩa các tập hợp quyền và các ràng buộc category/group tùy chọn có thể được gán cho người dùng. Sử dụng chúng để liệt kê, lấy, tạo, cập nhật, và xóa các role. Role đơn giản hóa việc quản lý quyền giữa các nhóm (teams). Việc chỉnh sửa role yêu cầu quyền admin; việc liệt kê và lấy yêu cầu một user session hoặc API Key hợp lệ.

### get_roles

```
GET /api/app/get_roles/v1
```

Lấy tất cả các định nghĩa user role. Không yêu cầu quyền cụ thể, bên cạnh một user session hoặc API Key hợp lệ.

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa tất cả các role, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng không có phân trang).

Ví dụ response:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "all",
            "title": "All Users",
            "enabled": true,
            "username": "admin",
            "modified": 1434125333,
            "created": 1434125333,
            "notes": "A base set of privileges for all users to enjoy.",
            "icon": "",
            "categories": [],
            "groups": [],
            "privileges": {
                "create_events": true,
                "edit_events": true,
                "run_jobs": true,
                "tag_jobs": true
            }
        }
    ],
    "list": { "length": 1 }
}
```

Xem [Role](data.md#role) để biết chi tiết về đối tượng role và các thuộc tính của nó.

### get_role

```
GET /api/app/get_role/v1
```

Lấy một định nghĩa role duy nhất bằng ID. Không yêu cầu quyền cụ thể, bên cạnh một user session hoặc API Key hợp lệ. Cả HTTP GET với các tham số chuỗi truy vấn và HTTP POST với JSON đều được cho phép.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của role để lấy. |

Ví dụ request:

```json
{ "id": "all" }
```

Ví dụ response:

```json
{
    "code": 0,
    "role": {
        "id": "all",
        "title": "All Users",
        "enabled": true,
        "username": "admin",
        "modified": 1434125333,
        "created": 1434125333,
        "notes": "A base set of privileges for all users to enjoy.",
        "icon": "",
        "categories": [],
        "groups": [],
        "privileges": {
            "create_events": true,
            "edit_events": true,
            "run_jobs": true,
            "tag_jobs": true
        }
    }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một đối tượng `role` chứa role được yêu cầu.

Xem [Role](data.md#role) để biết chi tiết về các thuộc tính của role.

### create_role

```
POST /api/app/create_role/v1
```

Tạo một user role mới. Yêu cầu quyền [create_roles](privileges.md#create_roles), cũng như một user session hoặc API Key hợp lệ. Request phải được gửi dưới dạng HTTP POST với nội dung JSON.

Xem [Role](data.md#role) để biết chi tiết về các thuộc tính đầu vào. Các thuộc tính `id`, `username`, `created`, `modified` và `revision` có thể được bỏ qua, vì chúng được tạo tự động (một `id` duy nhất sẽ được gán nếu bỏ qua, và `revision` ban đầu sẽ được đặt thành `1`). Nếu bỏ qua, `privileges` mặc định là một đối tượng trống, và `categories`/`groups` mặc định là các mảng trống.

Ví dụ request:

```json
{
    "title": "Operators",
    "enabled": true,
    "icon": "account-hard-hat",
    "notes": "Ops can run jobs and view logs.",
    "categories": ["cat1", "cat2"],
    "groups": ["main"],
    "privileges": {
        "run_jobs": true,
        "view_jobs": true
    }
}
```

Ví dụ response:

```json
{
    "code": 0,
    "role": { /* full role object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một đối tượng `role` chứa role vừa được tạo (bao gồm tất cả các thuộc tính được tạo tự động).

### update_role

```
POST /api/app/update_role/v1
```

Cập nhật một user role hiện có, được chỉ định bằng ID của nó. Yêu cầu quyền [edit_roles](privileges.md#edit_roles), cũng như một user session hoặc API Key hợp lệ. Request phải được gửi dưới dạng HTTP POST với nội dung JSON.

Xem [Role](data.md#role) để biết chi tiết về các thuộc tính đầu vào. Request được gộp nông (shallow-merged) vào role hiện có, vì vậy bạn có thể cung cấp một tập hợp thưa thớt các thuộc tính để cập nhật. Dấu thời gian `modified` được cập nhật tự động, và `revision` được tăng lên.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của role để cập nhật. |
| (Other) | Various | Bất kỳ trường [Role](data.md#role) nào có thể cập nhật (ví dụ: `title`, `enabled`, `categories`, `groups`, `privileges`, `icon`, `notes`). |

Ví dụ request:

```json
{
    "id": "operators",
    "title": "Operators (North Region)",
    "categories": ["cat_north"],
    "enabled": true
}
```

Ví dụ response:

```json
{ "code": 0 }
```

Ví dụ trên sẽ cập nhật các thuộc tính `title`, `categories` và `enabled` của role với ID `operators`. Các thuộc tính khác sẽ không bị sửa đổi (ngoại trừ `modified` và `revision`, được cập nhật tự động).
### delete_role

```
POST /api/app/delete_role/v1
```

Xoá một user role hiện có, được chỉ định bằng ID của nó. Cần có quyền [delete_roles](privileges.md#delete_roles), cũng như một user session hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của role cần xoá. |

Example request:

```json
{ "id": "operators" }
```

Example response:

```json
{ "code": 0 }
```




## Search

Các search API cung cấp tính năng truy vấn chỉ đọc trên các tập dữ liệu được lập chỉ mục (jobs, servers, alerts, snapshots, activity và stats). Sử dụng chúng để phân trang qua các kết quả, lấy bản tóm tắt và lọc theo các trường. Kết quả được tự động giới hạn bởi quyền truy cập category/group của người gọi. Một số endpoint (ví dụ: activity) chỉ dành cho admin; những endpoint khác chỉ yêu cầu session hợp lệ hoặc API Key.

### search_jobs

```
GET /api/app/search_jobs/v1
```

Tìm kiếm các jobs đã hoàn thành. Yêu cầu một user session hợp lệ hoặc API Key. Kết quả được tự động lọc theo quyền truy cập category và group của người gọi.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tuỳ chọn. [Truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*` nếu bị bỏ qua. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `completed`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |
| `verbose` | Boolean | Tuỳ chọn. Nếu `true`, bao gồm các trường job chi tiết (`actions`, `activity`, `input`, `files`, v.v.). Mặc định là `false` (tức là chúng bị cắt bỏ). |
| `select` | Array | Tuỳ chọn.  Nếu được bao gồm, sẽ chỉ trả về các thuộc tính [Job](data.md#job) được chỉ định trong mảng, ví dụ: `["id", "files"]`.  Ghi đè `verbose`. |

Để định dạng `query`, bạn có thể sử dụng [định dạng truy vấn đơn giản](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) kiểu GitHub hoặc [định dạng PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) nâng cao hơn.  Xem schema của [Jobs Database Table](db.dm#jobs) để biết các cột khả dụng bạn có thể tìm kiếm.

Các ví dụ truy vấn cho tham số `query`:

- `tags:_success`: Tất cả các jobs thành công. Các jobs thành công được gắn tag hệ thống ẩn `_success`.
- `tags:_error`: Tất cả các jobs thất bại vì bất kỳ lý do gì. Các jobs thất bại được gắn tag hệ thống ẩn `_error`.
- `tags:_files`: Tất cả các jobs có input hoặc output files.
- `code:warning`: Tất cả các jobs có code là `warning`.
- `code:critical`: Tất cả các jobs có code là `critical`.
- `code:abort`: Tất cả các jobs bị huỷ.
- `event:emk5piv8f6j2n49y`: Các jobs cho một event cụ thể bằng [Event.id](data.md#event-id) của nó.
- `category:general`: Các jobs cho một category cụ thể bằng [Category.id](data.md#category-id) của nó.
- `tags:important`: Các jobs được gắn tag user tag bằng [Tag.id](data.md#tag-id) của nó.
- `source:scheduler`: Các jobs được bắt đầu bởi một source cụ thể (xem [Job.source](data.md#job-source)).
- `source:workflow`: Tất cả các workflow sub-jobs.
- `plugin:shellplug`: Các jobs sử dụng một Plugin cụ thể bằng [Plugin.id](data.md#plugin-id) của nó.
- `plugin:_workflow`: Plugin ID đặc biệt để tìm kiếm tất cả các workflows.
- `server:smkee2akcswxcapy`: Các jobs đã chạy trên một server cụ thể bằng [Server.id](data.md#server-id) của nó.
- `groups:main`: Các jobs đã chạy trên một server trong một group bằng [Group.id](data.md#group-id) của nó.

Nhiều cột có thể được truy vấn bằng cách tách chúng bằng khoảng trắng. Ví dụ, `tags:_error category:general` yêu cầu cả hai mệnh đề phải khớp. Đối với các cột nhiều từ như `tags`, bạn có thể khớp nhiều giá trị bằng cách phân tách chúng bằng dấu cách, ví dụ: `tags:flag important` (yêu cầu cả hai tags). Đối với danh sách OR trên một cột duy nhất, hãy sử dụng dấu gạch đứng để phân tách, ví dụ: `tags:flag|important`.

Các trường ngày và số (như `date`) chấp nhận:

- Unix timestamp tính bằng giây (được lượng tử hoá làm tròn tới giờ gần nhất trong nội bộ), ví dụ: `1768430906`.
- Một ngày ở định dạng `YYYY-MM-DD` (được lượng tử hoá thành nửa đêm theo múi giờ server cục bộ).
- `today` (nửa đêm theo múi giờ server cục bộ).
- `now` (giờ server cục bộ hiện tại).

Ví dụ về khoảng ngày cho tất cả các jobs trong năm 2025: `date:>=2025-01-01 date:<2026-01-01`.

Sắp xếp: sử dụng `sort_by=completed` để sắp xếp theo thời gian hoàn thành job (không lượng tử hoá) hoặc `sort_by=elapsed` để sắp xếp theo thời gian đã trôi qua. Đặt `sort_dir=1` cho tăng dần hoặc `sort_dir=-1` cho giảm dần. Để tìm các jobs chạy lâu nhất, hãy đặt `query=*`, `sort_by=elapsed`, và `sort_dir=-1`.

Example response:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "jabc123",
            "event": "ev12345",
            "title": "Nightly Database Backup",
            "category": "ops",
            "plugin": "shellplug",
            "type": "event",
            "completed": 1757439210,
            "code": 0
        }
    ],
    "list": { "length": 287 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các bản ghi [Job](data.md#job) và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không cần phân trang). Khi `verbose` không được thiết lập, các trường lớn sẽ bị cắt bỏ khỏi các bản ghi job.

### search_servers

```
GET /api/app/search_servers/v1
```

Tìm kiếm các bản ghi server lịch sử. Yêu cầu một user session hợp lệ hoặc API Key.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tuỳ chọn. [Truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*`. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |

Để định dạng `query`, bạn có thể sử dụng [định dạng truy vấn đơn giản](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) kiểu GitHub hoặc [định dạng PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) nâng cao hơn.  Xem schema của [Servers Database Table](db.dm#servers) để biết các cột khả dụng bạn có thể tìm kiếm.

Các ví dụ truy vấn cho tham số `query`:

- `web` hoặc `keywords:web`: Tìm kiếm trường keywords mặc định.
- `groups:main`: Các servers trong một group cụ thể bằng [Group.id](data.md#group-id) của nó.
- `os_platform:linux`: Các servers trên một OS platform nhất định.
- `os_distro:ubuntu`: Các servers chạy một OS distribution cụ thể.
- `os_release:22_04`: Các servers chạy một OS release cụ thể.
- `os_arch:x86_64`: Các servers có một kiến trúc CPU cụ thể.
- `cpu_virt:kvm`: Các servers chạy dưới một nhà cung cấp ảo hoá cụ thể.
- `cpu_brand:intel`: Các servers có một chuỗi thương hiệu CPU cụ thể.
- `cpu_cores:8`: Các servers có một số lượng core cụ thể.
- `created:>=2025-01-01 created:<2026-01-01`: Các servers được tạo vào năm 2025.
- `modified:>=today`: Các servers được sửa đổi hôm nay (lần sửa đổi cuối cùng hoặc liên lạc cuối cùng).

Bạn có thể kết hợp các cột với khoảng trắng cho logic AND, ví dụ: `groups:main os_distro:ubuntu`. Sử dụng `|` cho OR trên một cột duy nhất, ví dụ: `os_platform:linux|windows`.

Các trường ngày và số (như `created` và `modified`) chấp nhận Unix timestamps, `YYYY-MM-DD`, `today`, và `now`, và được lượng tử hoá làm tròn tới giờ gần nhất trong nội bộ.

Example response:

```json
{
    "code": 0,
    "rows": [ /* server records */ ],
    "list": { "length": 42 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các bản ghi [Server](data.md#server) và một đối tượng `list` chứa siêu dữ liệu danh sách.

### search_alerts

```
GET /api/app/search_alerts/v1
```

Tìm kiếm các lệnh gọi alert đang hoạt động hoặc lịch sử. Yêu cầu một user session hợp lệ hoặc API Key.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tuỳ chọn. [Truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*`. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |

Để định dạng `query`, bạn có thể sử dụng [định dạng truy vấn đơn giản](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) kiểu GitHub hoặc [định dạng PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) nâng cao hơn.  Xem schema của [Alerts Database Table](db.dm#alerts) để biết các cột khả dụng bạn có thể tìm kiếm.

Các ví dụ truy vấn cho tham số `query`:

- `active:true`: Tất cả các lệnh gọi alert đang hoạt động.
- `alert:al12345`: Các lệnh gọi cho một định nghĩa alert cụ thể bằng [Alert.id](data.md#alert-id) của nó.
- `server:smkee2akcswxcapy`: Các lệnh gọi cho một server cụ thể bằng [Server.id](data.md#server-id) của nó.
- `groups:main`: Các lệnh gọi cho các servers trong một group cụ thể bằng [Group.id](data.md#group-id) của nó.
- `jobs:jabc123`: Các lệnh gọi liên quan đến một job cụ thể bằng [Job.id](data.md#job-id) của nó.
- `tickets:tmgpmoorz6p`: Các lệnh gọi liên quan đến một ticket cụ thể bằng [Ticket.id](data.md#ticket-id) của nó.
- `start:>=2025-01-01 start:<2026-01-01`: Các alerts đã kích hoạt vào năm 2025.
- `end:>=today`: Các alerts đã xoá hôm nay.

Các trường ngày và số (như `start` và `end`) chấp nhận Unix timestamps, `YYYY-MM-DD`, `today`, và `now`, và được lượng tử hoá làm tròn tới giờ gần nhất trong nội bộ.

Example response:

```json
{
    "code": 0,
    "rows": [ /* alert records */ ],
    "list": { "length": 12 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các bản ghi [AlertInvocation](data.md#alertinvocation) và một đối tượng `list` chứa siêu dữ liệu danh sách.

### search_snapshots

```
GET /api/app/search_snapshots/v1
```

Tìm kiếm các snapshots của server (các snapshots cho server đơn lẻ hoặc cho group). Yêu cầu một user session hợp lệ hoặc API Key.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tuỳ chọn. [Truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*`. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |
| `verbose` | Boolean | Tuỳ chọn. Nếu `true`, bao gồm các trường lồng nhau nặng (ví dụ: `data.processes`, `data.mounts`, group keys). Mặc định là `false` (những trường này bị cắt bỏ). |

Để định dạng `query`, bạn có thể sử dụng [định dạng truy vấn đơn giản](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) kiểu GitHub hoặc [định dạng PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) nâng cao hơn.  Xem schema của [Snapshots Database Table](db.dm#snapshots) để biết các cột khả dụng bạn có thể tìm kiếm.

Các ví dụ truy vấn cho tham số `query`:

- `type:server`: Chỉ các server snapshots.
- `type:group`: Chỉ các group snapshots.
- `source:alert`: Các snapshots được tạo bởi alert actions.
- `source:watch`: Các snapshots được tạo bởi watches.
- `source:user`: Các snapshots được tạo thủ công bởi users.
- `source:job`: Các snapshots được tạo bởi job actions.
- `server:smkee2akcswxcapy`: Các snapshots cho một server cụ thể bằng [Server.id](data.md#server-id) của nó.
- `groups:main`: Group snapshots cho một group cụ thể bằng [Group.id](data.md#group-id) của nó.
- `alerts:al12345`: Các snapshots đã chụp một lệnh gọi alert cụ thể bằng [AlertInvocation.id](data.md#alertinvocation-id) của nó.
- `jobs:jabc123`: Các snapshots đã chụp một job cụ thể bằng [Job.id](data.md#job-id) của nó.
- `date:>=2025-01-01 date:<2026-01-01`: Các snapshots được chụp trong năm 2025.

Các trường ngày và số (như `date`) chấp nhận Unix timestamps, `YYYY-MM-DD`, `today`, và `now`, và được lượng tử hoá làm tròn tới giờ gần nhất trong nội bộ.

Example response:

```json
{
    "code": 0,
    "rows": [ /* snapshot records */ ],
    "list": { "length": 8 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các bản ghi [Snapshot](data.md#snapshot) và một đối tượng `list` chứa siêu dữ liệu danh sách. Khi `verbose` không được thiết lập, các trường lớn sẽ bị cắt bỏ khỏi các bản ghi snapshot.

### search_tickets

```
GET /api/app/search_tickets/v1
```

Tìm kiếm các tickets bằng cú pháp truy vấn Unbase. Yêu cầu một user session hợp lệ hoặc API Key.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tuỳ chọn. [Truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*`. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |
| `compact` | Boolean | Tuỳ chọn. Nếu `true` (hoặc `1`), bỏ qua `body` và thay thế `changes` bằng số lượng của nó để có payload nhẹ hơn. |

Để định dạng `query`, bạn có thể sử dụng [định dạng truy vấn đơn giản](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) kiểu GitHub hoặc [định dạng PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) nâng cao hơn.  Xem schema của [Tickets Database Table](db.dm#tickets) để biết các cột khả dụng bạn có thể tìm kiếm.

Xem [Tickets → Searching](tickets.md#searching) cho các ví dụ truy vấn tìm kiếm.

Example response (compact):

```json
{
  "code": 0,
  "rows": [
    { "id": "tmgpmoorz6p", "num": 24, "subject": "...", "status": "open", "changes": 3 }
  ],
  "list": { "length": 57 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó bao gồm một mảng `rows` gồm các bản ghi [Ticket](data.md#ticket) và một đối tượng `list` với siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không cần phân trang). Khi `compact` được thiết lập, `body` bị bỏ qua và `changes` là số lượng các thay đổi.

### search_activity

```
GET /api/app/search_activity/v1
```

Tìm kiếm nhật ký activity (kiểm toán). Chỉ dành cho admin. Yêu cầu một session administrator hợp lệ hoặc API Key có quyền admin.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tuỳ chọn. [Truy vấn tìm kiếm kiểu Unbase](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*`. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |

Để định dạng `query`, bạn có thể sử dụng [định dạng truy vấn đơn giản](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries) kiểu GitHub hoặc [định dạng PxQL](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#pxql-queries) nâng cao hơn.  Xem schema của [Activity Database Table](db.dm#activity) để biết các cột khả dụng bạn có thể tìm kiếm.

Các ví dụ truy vấn cho tham số `query`:

- `action:job_error`: Các mục activity cho một action cụ thể (xem [Activity.action](data.md#activity-action)).
- `action:alert_new|alert_cleared`: Các mục activity khớp với nhiều actions.
- `keywords:admin`: Các mục activity đề cập đến một username hoặc ID cụ thể.
- `date:>=2025-01-01 date:<2026-01-01`: Activity vào năm 2025.
- `date:>=today`: Activity được ghi lại hôm nay.

Chỉ mục activity chỉ tiết lộ ba cột có thể tìm kiếm: `action`, `keywords`, và `date`. Các trường ngày và số (như `date`) chấp nhận Unix timestamps, `YYYY-MM-DD`, `today`, và `now`, và được lượng tử hoá làm tròn tới giờ gần nhất trong nội bộ.

Example response:

```json
{
    "code": 0,
    "rows": [ /* activity records */ ],
    "list": { "length": 120 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các bản ghi [Activity](data.md#activity), và một đối tượng `list` chứa siêu dữ liệu danh sách. Khi có sẵn, mỗi bản ghi activity cũng sẽ bao gồm một chuỗi `useragent` được tính toán dựa trên `headers.user-agent` ban đầu.

### search_revision_history

```
GET /api/app/search_revision_history/v1
```

Tìm kiếm nhật ký activity cho lịch sử sửa đổi (revision history) liên quan đến một kiểu dữ liệu cụ thể (ví dụ: events, plugins, roles). Yêu cầu một user session hợp lệ hoặc API Key.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `type` | String | **(Bắt buộc)** Kiểu dữ liệu để lọc theo. Một trong các: `alerts`, `categories`, `channels`, `events`, `groups`, `monitors`, `plugins`, `tags`, `web_hooks`, `buckets`, `secrets`, `tickets`, `roles`. |
| `query` | String | Tuỳ chọn. Các thuật ngữ tìm kiếm kiểu Unbase bổ sung để thực hiện phép AND với bộ lọc type. |
| `offset` | Number | Tuỳ chọn. Độ dịch dòng (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số hàng để trả về. Mặc định là `1`. |
| `sort_by` | String | Tuỳ chọn. Trường để sắp xếp. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |

Example response:

```json
{
    "code": 0,
    "rows": [ /* activity records for the selected type */ ],
    "list": { "length": 34 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa các bản ghi [Activity](data.md#activity) khớp với kiểu đã chọn, và một đối tượng `list` chứa siêu dữ liệu danh sách. Vì lý do bảo mật, các bản ghi này đã bị xoá một số chi tiết mạng (ví dụ: IPs và raw headers).

### search_stat_history

```
GET /api/app/search_stat_history/v1
```

Lấy các snapshots hàng ngày từ system stats history. Đây là các bộ đếm được tăng lên trong suốt cả ngày, và được sử dụng để hiển thị các biểu đồ lưới màu (swatch grids) "Job History Day Graph" và "Alert History Day Graph", cùng với những thứ khác. API yêu cầu một user session hợp lệ hoặc API Key.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `offset` | Number | Tuỳ chọn. Độ dịch ngày (zero-based) để phân trang. Mặc định là `0`. |
| `limit` | Number | Tuỳ chọn. Số ngày để trả về. Mặc định là `1`. |
| `path` | String | Tuỳ chọn. Đường dẫn có dấu chấm (dot-path) vào đối tượng stats để trả về một tập con (ví dụ: `daily.jobs`). |
| `key_prefix` | String | Tuỳ chọn. Nếu được thiết lập và node đã chọn là một đối tượng, chỉ bao gồm các key bắt đầu bằng tiền tố này. |
| `current_day` | Boolean | Tuỳ chọn. Nếu `true`, nối thêm các bộ đếm đang diễn ra cho ngày hiện tại dưới dạng một mục bổ sung. |

Example response:

```json
{
    "code": 0,
    "items": [
        {
            "epoch": 1757376000,
            "date": "2025-10-09",
            "data": { /* selected stats subtree for the day */ }
        }
    ],
    "list": { "length": 30 }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `items` chứa các bản ghi theo ngày với `epoch`, `date` con người có thể đọc được, và cây con `data` đã chọn, cộng với một đối tượng `list` chứa siêu dữ liệu danh sách.

### bulk_search_export

```
GET /api/app/bulk_search_export/v1
```

Truyền một bản xuất hàng loạt (bulk export) các kết quả tìm kiếm cho bất kỳ database index nào tới client. Yêu cầu một user session hợp lệ hoặc API Key. Kết quả được giới hạn bởi quyền truy cập category và group của người gọi giống như với các search APIs. Phản hồi là một streamed file, không phải JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `index` | String | **(Bắt buộc)** Database index ID để truy vấn. Các indexes được hỗ trợ là `jobs`, `tickets`, `servers`, `alerts`, `snapshots`, và `activity`. |
| `query` | String | Truy vấn tìm kiếm tuỳ chọn. Mặc định là `*`. Định dạng truy vấn phụ thuộc vào index đã chọn. |
| `columns` | Array(String) or String | **(Bắt buộc)** Các IDs của cột để đưa vào bản xuất, theo thứ tự mong muốn. Đối với các HTTP GET query strings, truyền một danh sách được phân tách bằng dấu phẩy. |
| `sort_by` | String | Tuỳ chọn. Sorter ID cho index. Mặc định là `_id`. |
| `sort_dir` | Number | Tuỳ chọn. Hướng sắp xếp: `1` cho tăng dần hoặc `-1` cho giảm dần. Mặc định là `-1`. |
| `format` | String | **(Bắt buộc)** Định dạng đầu ra: `csv`, `tsv`, hoặc `ndjson`. |
| `compress` | Boolean | Tuỳ chọn. Nếu được thiết lập thành bất kỳ giá trị true nào, phản hồi sẽ được nén gzip. Đối với HTTP GET query strings, sử dụng `compress=1`. |

Cú pháp truy vấn và các ví dụ được ghi lại trong các search APIs cho mỗi index:

- [search_jobs](#search_jobs)
- [search_tickets](#search_tickets)
- [search_servers](#search_servers)
- [search_alerts](#search_alerts)
- [search_snapshots](#search_snapshots)
- [search_activity](#search_activity)

Đối với các trường có thể tìm kiếm và các định nghĩa index, hãy xem [Database](db.md).

Example request:

```
GET /api/app/bulk_search_export/v1?index=jobs&query=tags:_error&columns=id,event,category,plugin,completed,code&sort_by=completed&sort_dir=-1&format=csv&compress=1
```

Response: `200 OK` với một streamed file. Các phản hồi CSV và TSV bao gồm một hàng tiêu đề sử dụng các tiêu đề cột đã được cấu hình. Các phản hồi NDJSON bao gồm một đối tượng JSON trên mỗi dòng với chỉ các cột được yêu cầu. Một UTF-8 BOM luôn được thêm vào phía trước để tương thích với bảng tính. Nếu `compress` được bật, phản hồi là gzip và tên tệp sẽ kết thúc bằng `.gz`.



### marketplace

```
GET /api/app/marketplace/v1
```

Tìm kiếm các danh sách và lấy thông tin chi tiết về sản phẩm từ [PTOps Marketplace](marketplace.md). Dữ liệu marketplace chỉ tồn tại trên GitHub, vì vậy điều này sẽ kích hoạt một yêu cầu bên ngoài, nhưng dữ liệu sẽ được lưu vào bộ nhớ cache cục bộ sau lần tìm nạp đầu tiên (TTL mặc định là 1 giờ). API có ba chế độ khác nhau, được kích hoạt bởi các tham số khác nhau:

**Tìm kiếm danh sách:**

Hành động mặc định của API là tìm kiếm trên marketplace cho các plugins. Các tham số sau được sử dụng cho tìm kiếm:

| Parameter Name | Description |
|----------------|-------------|
| `query` | Từ khoá tuỳ chọn, khớp không phân biệt chữ hoa chữ thường với các thuộc tính sản phẩm khác nhau (title, description, tags, license, v.v.). |
| `type` | Tuỳ chọn giới hạn kết quả ở một loại cụ thể, ví dụ: `plugin`. |
| `license` | Tuỳ chọn giới hạn kết quả ở một giấy phép cụ thể, ví dụ: `mit` (không phân biệt chữ hoa chữ thường). |
| `tags` | Tuỳ chọn giới hạn kết quả ở một hoặc nhiều tags, được phân tách bằng dấu phẩy và không phân biệt chữ hoa chữ thường. Tất cả đều phải khớp để được đưa vào. |
| `requires` | Tuỳ chọn giới hạn kết quả ở một hoặc nhiều yêu cầu, được phân tách bằng dấu phẩy và không phân biệt chữ hoa chữ thường. Tất cả đều phải khớp để được đưa vào. |
| `sort_by` | Thuộc tính dùng để sắp xếp (giá trị thuộc tính cần phải là một chuỗi, ví dụ: `title`). |
| `sort_dir` | Hướng sắp xếp (`1` là tăng dần, `-1` là giảm dần). |
| `offset` | Độ phân trang đối với tập kết quả phù hợp. |
| `limit` | Số hàng tối đa để trả về cùng lúc. |

Example:

```
GET /api/app/marketplace/v1?query=bluesky
```

Response:

```json
{
	"code": 0,
	"rows": [
		{
			"id": "pixlcore/xyplug-bluesky",
			"title": "Bluesky Social",
			"author": "PixlCore",
			"description": "Access your Bluesky social profile, read your timeline, make posts, leave likes, and more.",
			"versions": ["v1.0.3"],
			"type": "plugin",
			"license": "MIT",
			"tags": ["Bluesky", "Social", "MCP"],
			"requires": [ "npx", "uvx", "git" ],
			"created": "2026-01-01",
			"modified": "2026-01-01"
		}
	],
	"list": { "length": 1 }
}
```

`list.length` là tổng số hàng phù hợp trước khi cắt giảm phân trang.

**Lấy Metadata:**

Lấy siêu dữ liệu chung của marketplace, cụ thể là tất cả các loại sản phẩm độc nhất, các requirements, tags và licenses. Để sử dụng chế độ này, hãy thiết lập tham số chuỗi truy vấn `fields` thành bất kỳ giá trị true nào. Ví dụ:

```
GET /api/app/marketplace/v1?fields=1
```

Response:

```json
{
	"code": 0,
	"fields": {
		"types": ["plugin"],
		"requirements": ["npx", "uvx", "docker"],
		"tags": ["backup", "notification", "cleanup", "reporting"],
		"licenses": ["MIT", "GPL-3.0", "Apache-2.0"]
	}
}
```

**Lấy chi tiết sản phẩm:**

Lấy thông tin chi tiết sản phẩm về một sản phẩm cụ thể (và có thể là phiên bản). Bạn có thể lấy tệp README của sản phẩm (ở định dạng markdown), dữ liệu sản phẩm (ở định dạng [XYPDF](xypdf.md)) hoặc hình ảnh logo sản phẩm (ở định dạng nhị phân PNG). Để kích hoạt chế độ này, hãy chỉ định `id` của sản phẩm và tuỳ chọn một `version`. Nếu phiên bản bị bỏ qua, phiên bản mới nhất sẽ được sử dụng. Ví dụ:

Lấy README: `GET /api/app/marketplace/v1?id=pixlcore/xyplug-bluesky&readme=1`

Response:

```json
{
	"code": 0,
	"item": { /* product listing metadata */ },
	"version": "v1.0.3",
	"text": "...Markdown README content here..."
}
```

Lấy dữ liệu: `GET /api/app/marketplace/v1?id=pixlcore/xyplug-bluesky&data=1`

Response:

```json
{
	"code": 0,
	"item": { /* product listing metadata */ },
	"version": "v1.0.3",
	"data": { /* XYPDF data */ }
}
```

Lấy logo: `GET /api/app/marketplace/v1?id=pixlcore/xyplug-bluesky&logo=1`

(Phản hồi là dạng nhị phân trong trường hợp này.)

## Secrets

Các secrets được truyền cho jobs dưới dạng các biến môi trường khi quyền truy cập được cấp thông qua bất kỳ danh sách siêu dữ liệu (metadata lists) nào sau đây trên secret:

- `events`: Cấp cho các jobs [Event.id](data.md#event-id) cụ thể.
- `categories`: Cấp cho tất cả các events trong [Category.id](data.md#category-id) đã chọn.
- `plugins`: Cấp cho các jobs của [Plugin.id](data.md#plugin-id) cụ thể khi các plugins này được khởi chạy.

Jobs tự động nhận các biến mà không cần gọi bất kỳ API nào; hệ thống sẽ giải mã và tiêm chúng vào thời điểm khởi chạy. Tên biến tuân theo các quy tắc môi trường POSIX và được liệt kê trong [Secret.names](data.md#secret-names). Để xem hoặc chỉnh sửa giá trị trong UI, administrator có thể sử dụng [decrypt_secret](#decrypt_secret); các lần truy cập được ghi lại trong nhật ký activity.

Các web hooks có thể mở rộng các biến secret bằng cách sử dụng cú pháp mẫu (template syntax) như `{{ secrets.VAR_NAME }}` khi secret cấp quyền truy cập thông qua danh sách `web_hooks`. Xem [Secret.web_hooks](data.md#secret-web_hooks).

### get_secrets

```
GET /api/app/get_secrets/v1
```

Lấy tất cả metadata của secret. Không yêu cầu quyền đặc biệt nào, ngoại trừ một user session hợp lệ hoặc API Key. Lưu ý rằng API này chỉ trả về metadata của secret; dữ liệu biến secret thực tế được lưu trữ riêng và mã hoá.

Ngoài [Standard Response Format](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa tất cả các secrets, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không cần phân trang).

Example response:

```json
{
    "code": 0,
    "rows": [
        {
            "id": "zmeejkeb8nu",
            "title": "Dev Database Creds",
            "enabled": true,
            "icon": "",
            "notes": "This secret provides access to the dev database.",
            "names": ["DB_HOST", "DB_PASS", "DB_USER"],
            "events": ["emeekm2ablu"],
            "categories": [],
            "plugins": [],
            "web_hooks": ["example_hook"],
            "username": "admin",
            "modified": 1757204132,
            "created": 1755365953,
            "revision": 8
        }
    ],
    "list": { "length": 1 }
}
```

Xem [Secret](data.md#secret) để biết chi tiết về đối tượng secret và các thuộc tính của nó. Cấu trúc dữ liệu mã hoá thực tế được mô tả trong [Secret.fields](data.md#secret-fields).
### get_secret

```
GET /api/app/get_secret/v1
```

Lấy siêu dữ liệu của một secret thông qua ID. Không yêu cầu đặc quyền cụ thể nào, ngoại trừ một phiên người dùng hợp lệ hoặc API Key. Cho phép cả HTTP GET với các tham số chuỗi truy vấn và HTTP POST với JSON. Nó chỉ trả về siêu dữ liệu; không phải các giá trị biến đã được mã hóa.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của secret cần lấy. |

Example request:

```json
{ "id": "zmeejkeb8nu" }
```

Example response:

```json
{
    "code": 0,
    "secret": {
        "id": "zmeejkeb8nu",
        "title": "Dev Database Creds",
        "enabled": true,
        "icon": "",
        "notes": "This secret provides access to the dev database.",
        "names": ["DB_HOST", "DB_PASS", "DB_USER"],
        "events": ["emeekm2ablu"],
        "categories": [],
        "plugins": [],
        "web_hooks": ["example_hook"],
        "username": "admin",
        "modified": 1757204132,
        "created": 1755365953,
        "revision": 8
    }
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `secret` chứa siêu dữ liệu secret được yêu cầu. Để lấy và giải mã các giá trị biến thực tế, hãy sử dụng [decrypt_secret](#decrypt_secret).

Xem [Secret](data.md#secret) để biết chi tiết về các trường siêu dữ liệu.

### decrypt_secret

```
GET /api/app/decrypt_secret/v1
```

Giải mã và trả về dữ liệu biến của một secret. Chỉ dành cho admin. Yêu cầu một phiên quản trị viên hợp lệ hoặc API Key. Cho phép cả HTTP GET với các tham số chuỗi truy vấn và HTTP POST với JSON.

Quyền truy cập vào API này được ghi lại dưới dạng một giao dịch trong nhật ký hoạt động (loại action `secret_access`), được gắn thẻ với tên người dùng yêu cầu.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của secret cần giải mã. |

Example request:

```json
{ "id": "zmeejkeb8nu" }
```

Example response:

```json
{
    "code": 0,
    "fields": [
        { "name": "DB_HOST", "value": "db.dev.internal" },
        { "name": "DB_USER", "value": "appuser" },
        { "name": "DB_PASS", "value": "CorrectHorseBatteryStaple" }
    ]
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một mảng `fields` chứa các mục nhập [Secret.fields](data.md#secret-fields) đã được giải mã.

### create_secret

```
POST /api/app/create_secret/v1
```

Tạo một secret mới và lưu trữ dữ liệu biến đã được mã hóa của nó. Chỉ dành cho admin. Yêu cầu một phiên quản trị viên hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON.

Xem [Secret](data.md#secret) để biết chi tiết về các thuộc tính siêu dữ liệu. Các thuộc tính `id`, `username`, `created`, `modified` và `revision` có thể bị bỏ qua, vì chúng được tạo tự động (một `id` duy nhất sẽ được gán nếu bỏ qua, và `revision` ban đầu sẽ được đặt thành `1`). Bao gồm [Secret.fields](data.md#secret-fields) để xác định tên và giá trị của biến; chúng sẽ được mã hóa và lưu trữ tách biệt với siêu dữ liệu. Danh sách `names` được tự động tạo từ `fields` và được lưu trữ ở dạng văn bản thuần túy để hiển thị.

Example request:

```json
{
    "title": "Dev Database Creds",
    "enabled": true,
    "icon": "database-lock",
    "notes": "App DB credentials for dev",
    "events": ["emeekm2ablu"],
    "categories": ["cat_dev"],
    "plugins": ["shellplug"],
    "web_hooks": ["example_hook"],
    "fields": [
        { "name": "DB_HOST", "value": "db.dev.internal" },
        { "name": "DB_USER", "value": "appuser" },
        { "name": "DB_PASS", "value": "CorrectHorseBatteryStaple" }
    ]
}
```

Example response:

```json
{
    "code": 0,
    "secret": { /* full secret metadata, including auto-generated fields and names; excludes encrypted data */ }
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `secret` chứa siêu dữ liệu secret đã được tạo. Dữ liệu biến đã được mã hóa được lưu trữ riêng và không được trả về ở đây.

### update_secret

```
POST /api/app/update_secret/v1
```

Cập nhật siêu dữ liệu và/hoặc dữ liệu biến đã được mã hóa của một secret hiện có. Chỉ dành cho admin. Yêu cầu một phiên quản trị viên hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON.

Xem [Secret](data.md#secret) để biết chi tiết về các thuộc tính siêu dữ liệu. Yêu cầu được hợp nhất nông (shallow-merged) vào secret hiện có, vì vậy bạn có thể cung cấp một tập hợp các thuộc tính thưa thớt để cập nhật. Nếu bạn bao gồm [Secret.fields](data.md#secret-fields), các biến sẽ được mã hóa lại và lưu trữ; danh sách `names` sẽ được tạo lại từ các tên trường được cung cấp. Dấu thời gian `modified` được cập nhật tự động và `revision` được tăng lên.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của secret cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Secret](data.md#secret) nào có thể cập nhật (ví dụ: `title`, `enabled`, `fields`, `events`, `categories`, `plugins`, `web_hooks`, `icon`, `notes`). |

Yêu cầu ví dụ (chỉ cập nhật siêu dữ liệu):

```json
{
    "id": "zmeejkeb8nu",
    "title": "Dev Database Credentials",
    "enabled": false
}
```

Yêu cầu ví dụ (thay thế các biến):

```json
{
    "id": "zmeejkeb8nu",
    "fields": [
        { "name": "DB_HOST", "value": "db.dev.example.com" },
        { "name": "DB_USER", "value": "appuser" },
        { "name": "DB_PASS", "value": "NewStrongPassword123!" }
    ]
}
```

Example response:

```json
{ "code": 0 }
```

### delete_secret

```
POST /api/app/delete_secret/v1
```

Xóa một secret hiện có, bao gồm cả dữ liệu biến đã được mã hóa của nó. Chỉ dành cho admin. Yêu cầu một phiên quản trị viên hợp lệ hoặc API Key. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của secret cần xóa. |

Example request:

```json
{ "id": "zmeejkeb8nu" }
```

Example response:

```json
{ "code": 0 }
```



## Servers

Các API server có thể liệt kê các server đang hoạt động, lấy thông tin một server, cập nhật siêu dữ liệu của server, xóa một server, theo dõi các thay đổi và kích hoạt các snapshot. Dữ liệu server cung cấp cho các bảng điều khiển giám sát và định tuyến. Các thao tác chỉnh sửa hoặc phá hủy yêu cầu đặc quyền admin; các thao tác đọc yêu cầu một phiên hợp lệ hoặc API Key.

### get_server_summaries

```
GET /api/app/get_server_summaries/v1
```

Lấy thông tin tóm tắt các trường trên tất cả các server đã được lập chỉ mục (ví dụ: phân phối HĐH và CPU). Yêu cầu một phiên người dùng hợp lệ hoặc API Key.

Không có tham số đầu vào.

Example response:

```json
{
    "code": 0,
    "summaries": {
        "os_platform": { /* value → count map */ },
        "os_distro": { /* value → count map */ },
        "os_release": { /* value → count map */ },
        "os_arch": { /* value → count map */ },
        "cpu_virt": { /* value → count map */ },
        "cpu_brand": { /* value → count map */ },
        "cpu_cores": { /* value → count map */ }
    }
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `summaries` được đánh khóa bằng ID trường, mỗi đối tượng chứa một bản đồ ánh xạ giá trị-số lượng cho trường đó.

### get_active_servers

```
GET /api/app/get_active_servers/v1
```

Lấy tất cả các server đang hoạt động (được kết nối với server conductor hiện tại). Không yêu cầu tham số đầu vào. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hợp lệ hoặc API Key.

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một mảng `rows` gồm các server đang hoạt động, và một đối tượng `list` với siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng). Phản hồi ví dụ:

```json
{
  "code": 0,
  "rows": [
    {
      "id": "sorbstack01",
      "hostname": "centos-9-arm",
      "ip": "::ffff:10.1.10.241",
      "enabled": true,
      "groups": ["main"],
      "title": "",
      "icon": "",
      "autoGroup": true,
      "created": 1754365804,
      "modified": 1754872218,
      "socket_id": "wsme6crecj2o",
      "keywords": "centos-9-arm,::ffff:10,1,10,241,main,Linux,CentOS Stream,9,arm64,unknown,unknown,OrbStack,unknown,unknown,unknown",
      "info": {
        "os": { "platform": "Linux", "distro": "CentOS Stream", "release": "9", "arch": "arm64" },
        "cpu": { "cores": 10, "combo": "Apple" },
        "memory": { "total": 16810385408 },
        "virt": { "vendor": "OrbStack" },
        "satellite": "0.0.21"
      }
    }
  ],
  "list": { "length": 1 }
}
```

Xem [Server](data.md#server) để biết chi tiết về đối tượng server.

### get_active_server

```
GET /api/app/get_active_server/v1
```

Lấy thông tin một server đang hoạt động (trực tuyến) thông qua ID. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hợp lệ hoặc API Key. Cả HTTP GET với các tham số truy vấn và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID server cần lấy. |

Example request:

```json
{ "id": "sorbstack01" }
```

Example response:

```json
{
  "code": 0,
  "server": {
    "id": "sorbstack01",
    "hostname": "centos-9-arm",
    "ip": "::ffff:10.1.10.241",
    "enabled": true,
    "groups": ["main"],
    "title": "",
    "icon": "",
    "autoGroup": true,
    "created": 1754365804,
    "modified": 1754872218,
    "socket_id": "wsme6crecj2o",
    "info": {
      "os": { "platform": "Linux", "distro": "CentOS Stream", "release": "9", "arch": "arm64" },
      "cpu": { "cores": 10, "combo": "Apple" },
      "memory": { "total": 16810385408 },
      "virt": { "vendor": "OrbStack" },
      "satellite": "0.0.21"
    }
  }
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `server`. Xem [Server](data.md#server) để biết thêm chi tiết.

### get_server

```
GET /api/app/get_server/v1
```

Lấy thông tin một server thông qua ID từ kho lưu trữ, bao gồm cả dữ liệu giám sát trong phút gần nhất của nó. Nếu server hiện đang trực tuyến, bản ghi trong bộ nhớ sẽ được trả về; nếu mới ngoại tuyến gần đây, một bản sao được lưu trong bộ nhớ cache sẽ được trả về; nếu không thì bản ghi được lưu lần cuối sẽ được tải từ cơ sở dữ liệu. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hợp lệ hoặc API Key. Cả HTTP GET với các tham số truy vấn và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID server cần lấy. |

Example request:

```json
{ "id": "sorbstack01" }
```

Example response:

```json
{
  "code": 0,
  "server": { "id": "sorbstack01", "hostname": "centos-9-arm", "groups": ["main"], "enabled": true },
  "data": {
    "cpu": { "currentLoad": 0.14, "cores": 10 },
    "memory": { "total": 16810385408, "used": 572403712 },
    "load": [0.00, 0.04, 0.08],
    "jobs": 0
  },
  "online": true
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng [Server](data.md#server), một đối tượng `data` chứa [ServerMonitorData](data.md#servermonitordata), và một boolean `online` cho biết trạng thái kết nối hiện tại.

### update_server

```
POST /api/app/update_server/v1
```

Cập nhật siêu dữ liệu server (title, enabled, icon, groups, và auto-grouping). Yêu cầu một phiên hợp lệ hoặc API Key với đặc quyền [update_servers](privileges.md#update_servers). Gửi dưới dạng HTTP POST với JSON. Yêu cầu được hợp nhất nông vào bản ghi server hiện có.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Server.id](data.md#server-id) của server cần cập nhật. |
| `enabled` | Boolean | Tùy chọn bật hoặc tắt server như một mục tiêu event (các server bị tắt sẽ không được chọn cho các job). |
| `title` | String | Nhãn tùy chỉnh tùy chọn cho server, được hiển thị trong UI (theo mặc định, tên máy chủ (hostname) của server được hiển thị). |
| `icon` | String | ID biểu tượng tùy chọn cho server, được hiển thị trong UI. Các biểu tượng có nguồn từ [Material Design Icons](https://materialdesignicons.com/). |
| `groups` | Array | Tập hợp tùy chọn các [Group.id](data.md#group-id) cho server. Chỉ áp dụng nếu `autoGroup` là `false`. |
| `autoGroup` | Boolean | Tùy chọn thiết lập cờ tự động nhóm (auto-group) cho server (xem bên dưới). |
| `maxJobs` | Integer | Tùy chọn giới hạn số lượng job đồng thời được phép chạy trên server. |
| (Other) | Various | Bất kỳ trường [Server](data.md#server) nào khác có thể cập nhật. |

Hành vi đặc biệt:

- Nếu `autoGroup` là `true`, các group được tự động gán từ các quy tắc tên máy chủ và mọi `groups` được cung cấp sẽ bị ghi đè.
- Nếu `autoGroup` là `false`, bạn có thể thiết lập `groups` một cách rõ ràng.

Example request:

```json
{
  "id": "sorbstack01",
  "title": "Build Agent A",
  "enabled": true,
  "icon": "server",
  "groups": ["main", "staging"],
  "autoGroup": false
}
```

Example response:

```json
{ "code": 0 }
```

### update_server_data

```
POST /api/app/update_server_data/v1
```

Cập nhật [dữ liệu người dùng](servers.md#user-data) của server. Yêu cầu một phiên hợp lệ hoặc API Key với đặc quyền [update_servers](privileges.md#update_servers). Gửi dưới dạng HTTP POST với JSON. Các thuộc tính dữ liệu người dùng được hợp nhất nông vào đối tượng hiện có, trừ khi `replace` được thiết lập.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Server.id](data.md#server-id) của server cần cập nhật. |
| `data` | Object | **(Bắt buộc)** Các thuộc tính dữ liệu người dùng cần cập nhật (được hợp nhất nông theo mặc định). |
| `replace` | Boolean | Cờ tùy chọn, sẽ xóa và thay thế **toàn bộ** đối tượng dữ liệu người dùng nếu là `true`. |

Example request:

```json
{
  "id": "sorbstack01",
  "data": { "foo": "bar" }
}
```

Example response:

```json
{ "code": 0 }
```

### delete_server

```
POST /api/app/delete_server/v1
```

Xóa một server và tùy chọn xóa cả lịch sử của nó. Chỉ dành cho admin. Yêu cầu một phiên quản trị viên hợp lệ hoặc API Key. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID server cần xóa. |
| `history` | Boolean | Tùy chọn. Nếu `true`, cũng sẽ xóa bản ghi server, dữ liệu giám sát và các snapshot. Nếu bỏ qua hoặc `false`, chỉ gỡ cài đặt tác nhân khi trực tuyến và giữ lại lịch sử. |

Hành vi:

- Trực tuyến + `history: false`: Gỡ cài đặt PTOps Satellite và xóa server khỏi danh sách hoạt động; bản ghi server và lịch sử giám sát được giữ lại.
- Trực tuyến + `history: true`: Gỡ cài đặt Satellite, sau đó bắt đầu một job nền để xóa bản ghi server, dữ liệu giám sát và các snapshot.
- Ngoại tuyến: Bạn phải truyền `history: true` để xóa; nếu không, lệnh gọi sẽ thất bại vì chỉ có thể gỡ cài đặt khi trực tuyến.
- Việc xóa chạy trong nền; phản hồi được trả về ngay lập tức.

Yêu cầu ví dụ (xóa bao gồm cả lịch sử):

```json
{ "id": "sorbstack01", "history": true }
```

Example response:

```json
{ "code": 0 }
```

Các thao tác xóa là vĩnh viễn và không thể hoàn tác.

### watch_server

```
POST /api/app/watch_server/v1
```

Bắt đầu hoặc dừng việc theo dõi trên một server, thao tác này sẽ thực hiện một snapshot mỗi phút một lần trong một khoảng thời gian được chỉ định. Yêu cầu đặc quyền [create_snapshots](privileges.md#create_snapshots) và một phiên người dùng hợp lệ hoặc API Key. Hỗ trợ HTTP POST với JSON, hoặc HTTP GET với các tham số truy vấn.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID server cần theo dõi. |
| `duration` | Number | **(Bắt buộc)** Khoảng thời gian tính bằng giây. Đặt thành `0` để hủy theo dõi hiện có. |

Example request:

```json
{ "id": "sorbstack01", "duration": 3600 }
```

Example response:

```json
{ "code": 0 }
```

Xem [Snapshots](snapshots.md) để biết thêm chi tiết.

### create_snapshot

```
POST /api/app/create_snapshot/v1
```

Tạo một snapshot cho server được chỉ định bằng cách sử dụng dữ liệu server gần đây nhất. Yêu cầu đặc quyền [create_snapshots](privileges.md#create_snapshots) và một phiên người dùng hợp lệ hoặc API Key. Hỗ trợ HTTP POST với JSON, hoặc HTTP GET với các tham số truy vấn.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `server` | String | **(Bắt buộc)** ID server để tạo snapshot. |

Example request:

```json
{ "server": "sorbstack01" }
```

Example response:

```json
{ "code": 0, "id": "snmhr6zkefh1" }
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một thuộc tính `id` chứa [Snapshot.id](data.md#snapshot-id) mới.

Xem [Snapshots](snapshots.md) để biết thêm chi tiết.

### delete_snapshot

```
POST /api/app/delete_snapshot/v1
```

Xóa một snapshot server hoặc group đã cho [Snapshot.id](data.md#snapshot-id). Yêu cầu đặc quyền [delete_snapshots](privileges.md#delete_snapshots) và một phiên người dùng hợp lệ hoặc API Key. Hỗ trợ HTTP POST với JSON, hoặc HTTP GET với các tham số truy vấn.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** [Snapshot.id](data.md#snapshot-id) cần xóa. |

Example request:

```json
{ "id": "snmhr6zkefh1" }
```

Example response:

```json
{ "code": 0 }
```

Xem [Snapshots](snapshots.md) để biết thêm chi tiết.



## Tags

Các API tag quản lý các nhãn tự do có thể được áp dụng cho các job, event và ticket để hỗ trợ tổ chức và tìm kiếm. Sử dụng chúng để liệt kê, lấy, tạo, cập nhật và xóa các tag. Việc gắn tag cho phép tìm kiếm và lọc trong UI. Chỉnh sửa các tag yêu cầu các đặc quyền cụ thể; liệt kê và lấy thông tin yêu cầu một phiên hợp lệ hoặc API Key.

### get_tags

```
GET /api/app/get_tags/v1
```

Lấy tất cả các định nghĩa tag. Không yêu cầu tham số đầu vào. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hợp lệ hoặc API Key.

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một mảng `rows` chứa tất cả các tag, và một đối tượng `list` chứa siêu dữ liệu danh sách (ví dụ: `length` cho tổng số hàng mà không phân trang).

Example response:

```json
{
  "code": 0,
  "rows": [
    {
      "id": "important",
      "title": "Important",
      "icon": "alert-rhombus",
      "username": "admin",
      "modified": 1611173740,
      "created": 1611173740
    }
  ],
  "list": { "length": 1 }
}
```

Xem [Tag](data.md#tag) để biết chi tiết về đối tượng tag.

### get_tag

```
GET /api/app/get_tag/v1
```

Lấy thông tin một tag thông qua ID. Không yêu cầu đặc quyền cụ thể nào ngoài một phiên người dùng hợp lệ hoặc API Key. Cả HTTP GET với các tham số chuỗi truy vấn và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID tag cần lấy. |

Example request:

```json
{ "id": "important" }
```

Example response:

```json
{
  "code": 0,
  "tag": {
    "id": "important",
    "title": "Important",
    "icon": "alert-rhombus",
    "username": "admin",
    "modified": 1611173740,
    "created": 1611173740
  }
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), nó sẽ bao gồm một đối tượng `tag`. Xem [Tag](data.md#tag) để biết thêm chi tiết.
### create_tag

```
POST /api/app/create_tag/v1
```

Tạo một tag mới. Yêu cầu đặc quyền [create_tags](privileges.md#create_tags) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. `id` có thể bị bỏ qua và sẽ được tự động tạo.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | Tuỳ chọn. ID chữ và số để chỉ định; nếu bỏ qua, một ID duy nhất sẽ được tạo. |
| `title` | String | **(Bắt buộc)** Tiêu đề hiển thị cho tag. |
| `icon` | String | Tên icon tuỳ chọn cho tag (Material Design Icons). |
| `notes` | String | Các ghi chú hoặc bình luận tuỳ chọn về tag. |

Example request:

```json
{
  "title": "Important",
  "icon": "alert-rhombus",
  "notes": "Attention is needed!"
}
```

Example response:

```json
{
  "code": 0,
  "tag": { /* full tag object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một đối tượng `tag` chứa tag mới được tạo, bao gồm các trường được tự động tạo như `id`, `username`, `created`, `modified` (và `revision`). Xem [Tag](data.md#tag) để biết các thuộc tính.

### update_tag

```
POST /api/app/update_tag/v1
```

Cập nhật một tag hiện có bằng ID. Yêu cầu đặc quyền [edit_tags](privileges.md#edit_tags) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. Yêu cầu được gộp nông (shallow-merged) vào tag hiện có, do đó bạn có thể cung cấp một tập hợp thưa thớt (sparse set) các thuộc tính để cập nhật.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của tag cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Tag](data.md#tag) nào có thể cập nhật (ví dụ: `title`, `icon`, `notes`). |

Example request:

```json
{
  "id": "important",
  "title": "High Priority"
}
```

Example response:

```json
{ "code": 0 }
```

### delete_tag

```
POST /api/app/delete_tag/v1
```

Xoá một tag hiện có bằng ID. Yêu cầu đặc quyền [delete_tags](privileges.md#delete_tags) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của tag cần xoá. |

Example request:

```json
{ "id": "important" }
```

Example response:

```json
{ "code": 0 }
```

Các thao tác xoá là vĩnh viễn và không thể hoàn tác.



## Tickets

Các API ticket quản lý việc theo dõi sự cố hạng nhẹ (lightweight issue tracking) và bình luận bên trong PTOps. Sử dụng chúng để tạo, tìm kiếm, lấy, cập nhật các ticket, và thêm các thay đổi/bình luận. Các ticket có thể được liên kết với các job hoặc alert để ứng phó sự cố. Việc chỉnh sửa các ticket yêu cầu các đặc quyền cụ thể; việc tìm kiếm và đọc yêu cầu một session hoặc API Key hợp lệ.

### get_ticket

```
GET /api/app/get_ticket/v1
```

Lấy một ticket duy nhất bằng ID hoặc số của ticket. Không yêu cầu đặc quyền cụ thể nào ngoài một user session hoặc API Key hợp lệ. Cả HTTP GET với các tham số truy vấn và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | ID của ticket cần lấy. Bắt buộc nếu `num` không được cung cấp. |
| `num` | Number | Số của ticket cần lấy. Bắt buộc nếu `id` không được cung cấp. |

Example request (by ID):

```json
{ "id": "tmgpmoorz6p" }
```

Example request (by number):

```json
{ "num": 24 }
```

Example response:

```json
{
  "code": 0,
  "ticket": {
    "id": "tmgpmoorz6p",
    "num": 24,
    "subject": "Job #jmgn8f6ib7p failed with code: 1 (BlueSky Test)",
    "status": "open"
  }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một đối tượng `ticket`. Xem [Ticket](data.md#ticket) để biết chi tiết.

### get_tickets

```
GET /api/app/get_tickets/v1
```

Lấy nhiều ticket bằng ID trong một yêu cầu duy nhất. Không yêu cầu đặc quyền cụ thể nào ngoài một user session hoặc API Key hợp lệ. Cả HTTP GET với các tham số truy vấn và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `ids` | Array | **(Bắt buộc)** Mảng các ID ticket cần lấy. Phản hồi bảo toàn thứ tự này. |
| `verbose` | Boolean | Tuỳ chọn. Nếu `true`, bao gồm các trường nặng (heavy fields) (`body`, toàn bộ `changes`). Nếu bỏ qua hoặc `false`, các trường này sẽ bị cắt bớt (pruned). |

Example request:

```json
{ "ids": ["tmgpmoorz6p", "txyz123abcd"], "verbose": false }
```

Example response (non-verbose):

```json
{
  "code": 0,
  "tickets": [
    { "id": "tmgpmoorz6p", "num": 24, "subject": "...", "status": "open" },
    { "err": "Not Found" }
  ]
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một mảng `tickets` theo cùng thứ tự với `ids`. Khi `verbose` không được đặt, các trường lớn sẽ bị cắt bớt. Nếu một ticket không thể tải được, mục nhập mảng của nó sẽ chứa thuộc tính `err` thay vì đối tượng ticket. Xem [Ticket](data.md#ticket) để biết định nghĩa các trường.


### create_ticket

```
POST /api/app/create_ticket/v1
```

Tạo một ticket mới. Yêu cầu đặc quyền [create_tickets](privileges.md#create_tickets) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST. Bạn có thể gửi JSON, hoặc `multipart/form-data` nếu tải lên các tệp (files):

- Nội dung JSON: Gửi các trường của ticket dưới dạng JSON.
- Multipart form-data: Gửi `Content-Type: multipart/form-data` và bao gồm một trường `json` chứa toàn bộ payload JSON (dưới dạng chuỗi), cộng với một hoặc nhiều trường tệp (file fields). Các tệp được tải lên sẽ được đính kèm vào ticket.

Parameters (JSON):

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | Tuỳ chọn. Nếu bỏ qua, một ID duy nhất sẽ được tạo. Phải là chữ và số nếu được cung cấp. |
| `subject` | String | **(Bắt buộc)** Tóm tắt ngắn gọn cho ticket. HTML sẽ bị loại bỏ (stripped). |
| (Other) | Various | Bất kỳ trường [Ticket](data.md#ticket) nào, ví dụ: `type`, `status`, `category`, `server`, `assignees` (mảng), `cc` (mảng), `notify` (mảng email), `due` (giây Unix), `tags` (mảng), `body` (Markdown). |
| `template` | String | Tuỳ chọn. Tự động tạo `body` từ một mẫu (template). Các giá trị được phép: `job` hoặc `alert` (xem bên dưới). |
| `job` | String | Bắt buộc khi `template` là `job`. [Job.id](data.md#job-id) để sử dụng cho nội dung mẫu. |
| `alert` | String | Bắt buộc khi `template` là `alert`. [AlertInvocation.id](data.md#alertinvocation-id) để sử dụng cho nội dung mẫu. |

Khi sử dụng `multipart/form-data`, hãy đính kèm một hoặc nhiều trường tệp (tên trường bất kỳ). Các tệp được lưu và thêm vào [Ticket.files](data.md#ticket-files) cùng với metadata. Các tệp tự động hết hạn theo cài đặt cấu hình [file_expiration](config.md#file_expiration).

Mặc định: Nếu không được cung cấp, server thiết lập `status` thành `open`, `body` thành một chuỗi rỗng, `due` thành `0`, và khởi tạo `changes` bằng một mục nhập "created" ban đầu.

Example request (JSON):

```json
{
  "subject": "Nightly backup failed on server sorbstack01",
  "type": "issue",
  "status": "open",
  "assignees": ["admin"],
  "tags": ["important"],
  "body": "Observed failure in nightly backup job. See logs." 
}
```

Example response:

```json
{
  "code": 0,
  "ticket": { "id": "tmgpmoorz6p", "num": 24, "subject": "Nightly backup failed on server sorbstack01", "status": "open" }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một đối tượng `ticket` chứa [Ticket](data.md#ticket) mới được tạo (bao gồm các trường được tạo như `id`, `num`, `created`, `modified` và `changes`).

### update_ticket

```
POST /api/app/update_ticket/v1
```

Cập nhật một ticket hiện có bằng ID. Yêu cầu đặc quyền [edit_tickets](privileges.md#edit_tickets) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON. Yêu cầu được gộp nông (shallow-merged) vào ticket hiện có, do đó bạn có thể chỉ cung cấp các trường đã thay đổi.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của ticket cần cập nhật. |
| (Other) | Various | Bất kỳ trường [Ticket](data.md#ticket) nào có thể cập nhật, ví dụ: `subject`, `body`, `status`, `type`, `category`, `assignees`, `cc`, `notify`, `due`, `tags`, `server`. |

Notes:

- HTML trong `subject` sẽ bị loại bỏ; `body` được dọn dẹp (sanitized) dưới dạng Markdown.
- Các thay đổi được phát hiện và thêm vào (appended) [Ticket.changes](data.md#ticket-changes) (các ticket bản nháp (draft) không ghi lại các thay đổi).

Example request:

```json
{ "id": "tmgpmoorz6p", "status": "closed", "assignees": ["admin"] }
```

Example response:

```json
{ "code": 0, "ticket": { "id": "tmgpmoorz6p", "status": "closed" } }
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một đối tượng `ticket` đã được cập nhật. Xem [Ticket](data.md#ticket).

### add_ticket_change

```
POST /api/app/add_ticket_change/v1
```

Thêm một [change](data.md#ticket-changes) vào một ticket (thường là một bình luận). Yêu cầu đặc quyền [edit_tickets](privileges.md#edit_tickets) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của ticket cần cập nhật. |
| `change` | Object | **(Bắt buộc)** Đối tượng change. Đối với các bình luận, đặt `type` thành `comment` và cung cấp `body` (Markdown). Xem [Ticket.changes](data.md#ticket-changes) để biết chi tiết. |

Example request (add comment):

```json
{
  "id": "tmgpmoorz6p",
  "change": { "type": "comment", "body": "Investigating the backup logs now." }
}
```

Example response:

```json
{ "code": 0, "ticket": { "id": "tmgpmoorz6p", "changes": [ /* ... */ ] } }
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm đối tượng [Ticket](data.md#ticket) đã được cập nhật. Nội dung bình luận được dọn dẹp dưới dạng Markdown. Xem [Ticket.changes](data.md#ticket-changes).

### update_ticket_change

```
POST /api/app/update_ticket_change/v1
```

Chỉnh sửa hoặc xoá một ticket [change](data.md#ticket-changes) hiện có (ví dụ: một bình luận). Yêu cầu đặc quyền [edit_tickets](privileges.md#edit_tickets) và một user session hoặc API Key hợp lệ. Một người dùng có thể chỉnh sửa/xoá các bình luận của chính họ; việc chỉnh sửa/xoá các bình luận của người khác yêu cầu các đặc quyền administrator.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của ticket. |
| `change_id` | String | **(Bắt buộc)** ID của change cần chỉnh sửa hoặc xoá. |
| `change` | Object | Tuỳ chọn. Các trường change mới cần gộp (ví dụ: `body` cho các chỉnh sửa bình luận). Xem [Ticket.changes](data.md#ticket-changes) để biết chi tiết. |
| `delete` | Boolean | Tuỳ chọn. Nếu `true`, xoá change được chỉ định. |

Example request (edit comment):

```json
{ "id": "tmgpmoorz6p", "change_id": "cabc123", "change": { "body": "Updated findings after deeper analysis." } }
```

Example request (delete comment):

```json
{ "id": "tmgpmoorz6p", "change_id": "cabc123", "delete": true }
```

Example response:

```json
{ "code": 0, "ticket": { "id": "tmgpmoorz6p", "changes": [ /* ... */ ] } }
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm đối tượng [Ticket](data.md#ticket) đã được cập nhật. Nội dung bình luận được dọn dẹp và các chỉnh sửa ghi lại một mốc thời gian (timestamp) `edited`. Xem [Ticket.changes](data.md#ticket-changes).

### upload_user_ticket_files

```
POST /api/app/upload_user_ticket_files/v1
```

Tải lên các tệp (files) ticket. Yêu cầu đặc quyền [edit_tickets](privileges.md#edit_tickets) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với `Content-Type: multipart/form-data` và bao gồm một trường `json` chứa toàn bộ payload JSON (dưới dạng chuỗi), cộng với một hoặc nhiều trường tệp. Các tệp được tải lên có thể được đính kèm vào ticket thông qua tham số `save`.

Parameters (JSON):

| Property Name | Type | Description |
|---------------|------|-------------|
| `ticket` | String | **(Bắt buộc)** [Ticket.id](data.md#ticket-id) để đính kèm các tệp vào. |
| `save` | Boolean | Tuỳ chọn. Nếu có mặt và là `true`, các tệp sẽ được đính kèm vào ticket. Ngược lại, chúng được coi là nội dung người dùng thả (dropped) vào phần thân (body). |

Đính kèm một hoặc nhiều trường tệp (tên trường bất kỳ). Các tệp được lưu và thêm vào [Ticket.files](data.md#ticket-files) cùng với metadata. Các tệp tự động hết hạn theo cài đặt cấu hình [file_expiration](config.md#file_expiration).

Example request (JSON):

```json
{
  "id": "tmi9kl02hbb",
  "save": true
}
```

Example response:

```json
{
	"code": 0,
	"files": [
		{
			"id": "fmi4us46yno",
			"date": 1763487257,
			"filename": "report-optimized.png",
			"path": "files/tmhzbmbagig/admin/tQq3xZEQR2_vhvhh4L8WnA/report-optimized.png",
			"size": 29959,
			"username": "admin",
			"ticket": "tmhzbmbagig"
		}
	]
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một mảng `files` chứa tất cả các [Ticket.files](data.md#ticket.files), bao gồm cả những tệp mới được tải lên.

### delete_ticket_file

```
POST /api/app/delete_ticket_file/v1
```

Xoá một tệp được đính kèm vào một ticket. Yêu cầu đặc quyền [edit_tickets](privileges.md#edit_tickets) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của ticket. |
| `path` | String | **(Bắt buộc)** Đường dẫn lưu trữ của tệp cần xoá. |

Example request:

```json
{ "id": "tmgpmoorz6p", "path": "files/tmgpmoorz6p/admin/abc123/log.txt" }
```

Example response:

```json
{ "code": 0, "files": [ /* remaining File objects */ ] }
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một mảng `files` với các đối tượng [File](data.md#file) còn lại của ticket.

### delete_ticket

```
POST /api/app/delete_ticket/v1
```

Xoá một ticket hiện có bằng ID. Yêu cầu đặc quyền [delete_tickets](privileges.md#delete_tickets) và một user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của ticket cần xoá. |

Example request:

```json
{ "id": "tmgpmoorz6p" }
```

Example response:

```json
{ "code": 0 }
```

Việc xoá sẽ xoá ticket vĩnh viễn. Các tham chiếu (references) đến ticket trong các job và alert sẽ được dọn dẹp bởi các tác vụ bảo trì nền (background maintenance tasks).



## Users

Các API user quản lý các tài khoản người dùng. Lưu ý rằng hầu hết các API quản lý user được xử lý trong thành phần [pixl-server-user](https://github.com/jhuckaby/pixl-server-user). Các API duy nhất được liệt kê ở đây là những API cụ thể cho PTOps.

### get_user_activity

```
GET /api/app/get_user_activity/v1
```

Lấy các mục nhập nhật ký hoạt động (activity log entries) cho người dùng hiện tại (ví dụ: đăng nhập, thay đổi mật khẩu), có phân trang. Yêu cầu một user session hoặc API Key hợp lệ. Cả HTTP GET với các tham số truy vấn và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `offset` | Number | Chỉ mục dựa trên 0 (Zero-based index) vào danh sách hoạt động (mặc định là `0`). |
| `limit` | Number | Số hàng sẽ trả về (mặc định là `50`). |

Example response:

```json
{
  "code": 0,
  "rows": [
    {
      "action": "user_login",
      "session_id": "...",
      "ip": "203.0.113.5",
      "created": 1755400000,
      "headers": { "user-agent": "Mozilla/5.0 ..." },
      "useragent": "Chrome 119.0 / macOS"
    }
  ],
  "list": { "length": 42 }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một mảng `rows` với các mục nhập hoạt động của người dùng (mới nhất trước), và một đối tượng `list` với metadata phân trang. Một chuỗi `useragent` được bao gồm cho mỗi hàng khi có sẵn.

### user_settings

```
POST /api/app/user_settings/v1
```

Cập nhật các cài đặt không quan trọng (non-critical settings) cho người dùng hiện tại (ví dụ: các tuỳ chọn UI như ngôn ngữ, múi giờ, độ tương phản, chuyển động, âm lượng). Các thuộc tính quan trọng bị server-side bỏ qua (mật khẩu, salts, `active`, `privileges`, `roles`, `created`). Yêu cầu một user session hợp lệ.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| (Other) | Various | Bất kỳ trường [User](data.md#user) không quan trọng nào như `language`, `region`, `num_format`, `hour_cycle`, `timezone`, `color_acc`, `privacy_mode`, `effects`, `page_info`, `contrast`, `motion`, `volume`, hoặc `icon`. |

Example request:

```json
{
  "language": "en-US",
  "timezone": "America/Los_Angeles",
  "contrast": "high",
  "motion": "reduced"
}
```

Example response:

```json
{
  "code": 0,
  "user": { /* sanitized user object without password/salt */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một đối tượng `user` chứa người dùng đã được cập nhật với các trường nhạy cảm đã bị loại bỏ. Các thay đổi được lưu trữ (persisted) nhưng không được ghi lại dưới dạng hoạt động quan trọng.

### logout_all

```
POST /api/app/logout_all/v1
```

Đăng xuất tất cả các session liên kết với người dùng hiện tại, ngoại trừ session hiện tại. Yêu cầu một user session hợp lệ và mật khẩu hiện tại của người dùng.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `password` | String | **(Bắt buộc)** Mật khẩu tài khoản hiện tại để xác minh. |

Example request:

```json
{ "password": "correcthorsebatterystaple" }
```

Example response:

```json
{ "code": 0 }
```

Notes:

- Thao tác chạy trong nền (background) sau khi trả về phản hồi; bất kỳ websocket nào đang kết nối đều bị đóng và các session bị xoá.
- Một báo cáo session được gửi qua email khi các session thực sự bị chấm dứt.
- Các administrator có thể thực hiện hành động tương tự cho người dùng khác thông qua [admin_logout_all](#admin_logout_all).



## Web Hooks

Các API web hook quản lý các callback HTTP gọi ra ngoài (outbound) được sử dụng bởi các alert, job action và workflow. Sử dụng chúng để liệt kê, lấy, tạo, cập nhật, và xoá các định nghĩa web hook, có thể bao gồm các header, xác thực và các payload theo mẫu (bao gồm việc mở rộng các secret). Các lần thực thi được ghi lại với hoạt động của job; việc chỉnh sửa yêu cầu các đặc quyền cụ thể.

### get_web_hooks

```
GET /api/app/get_web_hooks/v1
```

Lấy tất cả các định nghĩa web hook. Không yêu cầu tham số đầu vào. Không yêu cầu đặc quyền cụ thể nào ngoài một user session hoặc API Key hợp lệ.

Ngoài [Standard Response Format](#standard-response-format), phản hồi này sẽ bao gồm một mảng `rows` chứa tất cả các web hook, và một đối tượng `list` chứa metadata danh sách (ví dụ: `length` cho tổng số hàng không có phân trang).

Example response:

```json
{
  "code": 0,
  "rows": [
    {
      "id": "example_hook",
      "title": "Example Hook",
      "enabled": true,
      "url": "https://httpbin.org/post",
      "method": "POST",
      "headers": [
        { "name": "Content-Type", "value": "application/json" },
        { "name": "User-Agent", "value": "PTOps/WebHook" }
      ],
      "body": "{\n\t\"text\": \"{{text}}\"\n}",
      "timeout": 30,
      "retries": 0,
      "follow": false,
      "ssl_cert_bypass": false,
      "max_per_day": 0,
      "icon": "",
      "notes": "",
      "username": "admin",
      "modified": 1754449105,
      "created": 1754365754,
      "revision": 2
    }
  ],
  "list": { "length": 1 }
}
```

Xem [WebHook](data.md#webhook) để biết chi tiết về các thuộc tính web hook.

### get_web_hook

```
GET /api/app/get_web_hook/v1
```

Lấy một định nghĩa web hook duy nhất bằng ID. Không yêu cầu đặc quyền cụ thể nào ngoài một user session hoặc API Key hợp lệ. Cả HTTP GET với các tham số truy vấn chuỗi (query string parameters) và HTTP POST với JSON đều được chấp nhận.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID chữ và số của web hook cần lấy. |

Example request:

```json
{ "id": "example_hook" }
```

Example response:

```json
{
  "code": 0,
  "web_hook": {
    "id": "example_hook",
    "title": "Example Hook",
    "enabled": true,
    "url": "https://httpbin.org/post",
    "method": "POST",
    "headers": [
      { "name": "Content-Type", "value": "application/json" },
      { "name": "User-Agent", "value": "PTOps/WebHook" }
    ],
    "body": "{\n\t\"text\": \"{{text}}\"\n}",
    "timeout": 30,
    "retries": 0,
    "follow": false,
    "ssl_cert_bypass": false,
    "max_per_day": 0,
    "icon": "",
    "notes": "",
    "username": "admin",
    "modified": 1754449105,
    "created": 1754365754,
    "revision": 2
  }
}
```

Ngoài [Standard Response Format](#standard-response-format), phản hồi này bao gồm một đối tượng `web_hook` chứa web hook được yêu cầu.

Xem [WebHook](data.md#webhook) để biết chi tiết thuộc tính và hành vi theo mẫu (templating behavior).
### create_web_hook

```
POST /api/app/create_web_hook/v1
```

Tạo một web hook mới. Yêu cầu quyền [create_web_hooks](privileges.md#create_web_hooks), cộng với user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST kèm JSON. Xem [WebHook](data.md#webhook) để biết chi tiết thuộc tính. `id` có thể bị bỏ qua và sẽ được tự động tạo; `username`, `created`, `modified`, và `revision` được server thiết lập.

Ghi chú:

- Server xác thực `id` (chữ và số/dấu gạch dưới), `method` (chỉ chữ cái) và `url` (phải là `http` hoặc `https`).
- Nếu `body` được cung cấp, bất kỳ template `{{ ... }}` nào cũng được biên dịch trước và lỗi cú pháp sẽ trả về phản hồi lỗi.
- Các web hook có thể mở rộng các secret trong quá trình chạy khi được cho phép qua [Secret.web_hooks](data.md#secret-web_hooks).

Example request:

```json
{
  "title": "Example Hook",
  "enabled": true,
  "url": "https://httpbin.org/post",
  "method": "POST",
  "headers": [
    { "name": "Content-Type", "value": "application/json" },
    { "name": "User-Agent", "value": "PTOps/WebHook" }
  ],
  "body": "{\n  \"text\": \"{{text}}\",\n  \"content\": \"{{text}}\"\n}",
  "timeout": 30,
  "retries": 0,
  "follow": false,
  "ssl_cert_bypass": false,
  "max_per_day": 0,
  "notes": "An example web hook for demonstration purposes.",
  "icon": ""
}
```

Example response:

```json
{
  "code": 0,
  "web_hook": { /* full web hook object including auto-generated fields */ }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó bao gồm đối tượng `web_hook` chứa web hook mới được tạo.

### update_web_hook

```
POST /api/app/update_web_hook/v1
```

Cập nhật một web hook hiện có theo ID. Yêu cầu quyền [edit_web_hooks](privileges.md#edit_web_hooks), cộng với user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST kèm JSON. Request được shallow-merge vào web hook hiện có, vì vậy bạn có thể cung cấp một tập hợp các thuộc tính thưa thớt để cập nhật. Server sẽ tự động cập nhật `modified` và tăng `revision`.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của web hook cần cập nhật. |
| (Other) | Various | Bất kỳ trường [WebHook](data.md#webhook) nào có thể cập nhật (ví dụ: `title`, `enabled`, `url`, `method`, `headers`, `body`, `timeout`, `retries`, `follow`, `ssl_cert_bypass`, `max_per_day`, `notes`, `icon`). |

Ghi chú:

- Nếu `body` được cung cấp, các template sẽ được biên dịch trước; lỗi cú pháp sẽ dẫn đến phản hồi lỗi.

Example request:

```json
{
  "id": "example_hook",
  "title": "Example Hook (updated)",
  "timeout": 60,
  "follow": true
}
```

Example response:

```json
{ "code": 0 }
```

### delete_web_hook

```
POST /api/app/delete_web_hook/v1
```

Xóa một web hook theo ID. Yêu cầu quyền [delete_web_hooks](privileges.md#delete_web_hooks), cộng với user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST kèm JSON.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của web hook cần xóa. |

Example request:

```json
{ "id": "example_hook" }
```

Example response:

```json
{ "code": 0 }
```

Các thao tác xóa là vĩnh viễn và không thể hoàn tác.

### test_web_hook

```
POST /api/app/test_web_hook/v1
```

Kiểm tra cấu hình web hook bằng cách thực hiện HTTP request trực tiếp và trả về báo cáo chi tiết, được định dạng markdown. Yêu cầu quyền [edit_web_hooks](privileges.md#edit_web_hooks), cộng với user session hoặc API Key hợp lệ. Gửi dưới dạng HTTP POST kèm JSON.

Hành vi:

- Nếu `id` được cung cấp khớp với một web hook hiện có, server sẽ merge nó với nội dung request, cho phép bạn ghi đè các trường để kiểm tra mà không lưu chúng.
- Các template trong `url`, `headers[].value`, và `body` được mở rộng bằng cách sử dụng cùng dữ liệu như các action trong quá trình chạy. Khi kiểm tra một hook hiện có, đã lưu, các secret sẽ được bao gồm nếu được cấp phép qua [Secret.web_hooks](data.md#secret-web_hooks).
- Các timeout, retries, hành vi chuyển hướng (`follow`), và xác thực TLS (`ssl_cert_bypass`) được tuân thủ trong quá trình kiểm tra.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Bắt buộc)** ID của web hook cần kiểm tra (hook hiện có là tùy chọn, nhưng bắt buộc phải có ID). |
| `title` | String | **(Bắt buộc)** Tiêu đề cho bài kiểm tra. Bắt buộc ngay cả khi kiểm tra hook hiện có. |
| `method` | String | **(Bắt buộc)** HTTP method để sử dụng (ví dụ: `GET`, `POST`). |
| `url` | String | **(Bắt buộc)** URL `http` hoặc `https` đầy đủ điều kiện để gọi. |
| (Other) | Various | Bất kỳ trường [WebHook](data.md#webhook) nào chỉ áp dụng cho bài kiểm tra này (ví dụ: `headers`, `body`, `timeout`, `retries`, `follow`, `ssl_cert_bypass`). |

Example request (override headers and timeout for an existing hook):

```json
{
  "id": "example_hook",
  "title": "Example Hook",
  "method": "POST",
  "url": "https://httpbin.org/post",
  "headers": [ { "name": "Content-Type", "value": "application/json" } ],
  "body": "{\n  \"text\": \"Hello from test\"\n}",
  "timeout": 10
}
```

Example response:

```json
{
  "code": 0,
  "result": {
    "code": 0,
    "description": "Success (HTTP 200 OK)",
    "details": "- **Method:** POST\n- **URL:** https://httpbin.org/post\n\n**Response:** HTTP 200 OK\n\n..."
  }
}
```

Ngoài [Standard Response Format](#standard-response-format), nó bao gồm một đối tượng `result` với:

- `code`: `0` khi thành công, hoặc một mã lỗi chuỗi (ví dụ: `"webhook"`).
- `description`: Đoạn văn bản tóm tắt ngắn (ví dụ: trạng thái HTTP).
- `details`: Một báo cáo được định dạng markdown bao gồm các header và body của request/response, và các chỉ số hiệu suất khi có sẵn.



## Administrative

Các API Quản trị cung cấp các tiện ích bảo trì và xuất/nhập trên toàn hệ thống dành cho quản trị viên. Sử dụng chúng để nhập/xuất dữ liệu hàng loạt, quản lý cấu hình, và thực hiện các tác vụ bảo trì. Các endpoint này chỉ dành cho quản trị viên (trừ khi có chỉ định khác) và tất cả các thao tác ghi đều được kiểm tra trong activity log.

### get_servers

```
GET /api/app/get_servers/v1
```

Lấy một snapshot trực tiếp của tất cả các worker server và conductor/peer server đang kết nối. Yêu cầu user session hoặc API key hợp lệ.

Không có tham số đầu vào.

Ngoài [Standard Response Format](#standard-response-format), phần này trả về:

- `servers`: Object được khóa theo server ID chứa các đối tượng [Server](data.md#server) cho tất cả các worker đang kết nối hiện tại.
- `masters`: Object được khóa theo host ID với các đối tượng [Conductor](data.md#conductor) cho trạng thái, phiên bản và các thống kê cơ bản.

Example response:

```json
{
  "code": 0,
  "servers": {
    "sorbstack01": { "id": "sorbstack01", "hostname": "centos-9-arm", "groups": ["main"], "enabled": true, "modified": 1754872218, "info": { /* see Server */ } }
  },
  "masters": {
    "conductor-a": { "id": "conductor-a", "online": true, "master": true, "date": 1754800000, "version": "0.0.0", "ping": 0, "stats": { /* mem, load */ } }
  }
}
```

### get_global_state

```
GET /api/app/get_global_state/v1
```

Lấy đối tượng [State](data.md#state) conductor trong bộ nhớ. Điều này bao gồm các cờ thời gian chạy (ví dụ: bộ lập lịch được bật), các watch và trạng thái nội bộ khác được sử dụng bởi conductor. Yêu cầu user session hoặc API key hợp lệ.

Không có tham số đầu vào.

Ngoài [Standard Response Format](#standard-response-format), phần này trả về một đối tượng `state` chứa trạng thái conductor hiện tại. Nội dung chủ yếu là nội bộ và có thể thay đổi giữa các bản phát hành.

Example response:

```json
{
  "code": 0,
  "state": {
    "scheduler": { "enabled": true },
    "watches": { /* server/group watch timers */ }
  }
}
```

Xem [State](data.md#state) để biết thêm chi tiết.

### update_global_state

```
POST /api/app/update_global_state/v1
```

Cập nhật một hoặc nhiều giá trị trạng thái conductor bằng cách sử dụng các đường dẫn thuộc tính "dấu chấm" trong đối tượng [State](data.md#state). Chỉ dành cho quản trị viên. Hữu ích cho việc bật/tắt các tính năng hệ thống mà không cần khởi động lại (ví dụ: tạm dừng bộ lập lịch).

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| (Other) | Various | Một hoặc nhiều thuộc tính đường dẫn dấu chấm cần cập nhật trong trạng thái conductor (ví dụ: `"scheduler.enabled": false`). |

Example request:

```json
{ "scheduler.enabled": false }
```

Example response:

```json
{ "code": 0 }
```

Tất cả các cập nhật đều được kiểm tra trong activity log dưới dạng các giao dịch `state_update`.

### get_internal_jobs

```
GET /api/app/get_internal_jobs/v1
```

Lấy tất cả các internal job hiện đang chạy.  Chỉ dành cho quản trị viên.

Không có tham số đầu vào.

Example response:

```json
{
	"code": 0,
	"rows": [
		{
			"title": "Test job that does nothing",
			"username": "admin",
			"type": "maint",
			"id": "imj961vgn1eech2w",
			"started": 1765924835.207,
			"progress": 0.5
		}
	],
	"list": {
		"length": 1
	}
}
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm một đối tượng `jobs` với một thuộc tính cho mỗi internal job đang chạy.  Các đối tượng con sẽ chứa thông tin về mỗi internal job đang chạy, bao gồm nhưng không giới hạn ở: `id` (ID chữ và số duy nhất cho job), `progress` (0.0 đến 1.0), `type` (bảo trì, cơ sở dữ liệu, v.v.), `title`, `username`, `started` (epoch), và cả các thuộc tính cụ thể của job.

### test_internal_job

```
POST /api/app/test_internal_job/v1
```

Tạo một internal job giả chạy trong khoảng 60 giây và báo cáo tiến độ. Chỉ dành cho quản trị viên. Điều này nhằm mục đích kiểm tra UI Internal System Jobs và các cơ chế thông báo.

API này chấp nhận một tham số `duration` duy nhất, có thể được thiết lập thành một số lượng giây tùy chỉnh.

Example response:

```json
{ "code": 0 }
```

Test job xuất hiện trong bảng Internal Jobs và hoàn thành tự động.

### bulk_search_delete_jobs

```
POST /api/app/bulk_search_delete_jobs/v1
```

Bắt đầu một job nền để xóa hàng loạt các job đã hoàn thành theo truy vấn tìm kiếm. Yêu cầu quyền [delete_jobs](privileges.md#delete_jobs).

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `query` | String | Tùy chọn. [Unbase-style query](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). Mặc định là `*` (tất cả các job). |

Example request:

```json
{ "query": "category:ops code:0" }
```

Example response:

```json
{ "code": 0 }
```

Việc xóa chạy trong nền. Tiến độ và kết quả có thể xem được trong Internal Jobs và activity log.

### bulk_search_delete

```
POST /api/app/bulk_search_delete/v1
```

Bắt đầu một job nền để xóa các bản ghi trong một index tùy ý theo truy vấn tìm kiếm. Chỉ dành cho quản trị viên.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `index` | String | **(Bắt buộc)** ID index cơ sở dữ liệu mục tiêu (ví dụ: `jobs`, `servers`, `snapshots`, `alerts`, `activity`). |
| `query` | String | **(Bắt buộc)** [Unbase-style query](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries). |

Example request:

```json
{ "index": "jobs", "query": "category:ops code:0" }
```

Example response:

```json
{ "code": 0, "id": "ijob12345" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm `id` với ID của internal job theo dõi việc xóa nền.

### admin_run_maintenance

```
POST /api/app/admin_run_maintenance/v1
```

Chạy bảo trì hàng đêm ngay lập tức (dọn dẹp trạng thái, cắt giảm timeline và cơ sở dữ liệu, và bảo trì lưu trữ). Chỉ dành cho quản trị viên.

Không có tham số đầu vào. Trả về ngay lập tức trong khi việc bảo trì tiếp tục trong nền dưới dạng một internal job.

Example response:

```json
{ "code": 0, "id": "imj97z8isl3bqvas" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm một thuộc tính `id`, là ID của internal job (việc bảo trì chạy bất đồng bộ trong nền).  Để theo dõi tiến độ của job, hãy thăm dò API [get_internal_jobs](#get_internal_jobs).

### admin_run_optimization

```
POST /api/app/admin_run_optimization/v1
```

Chạy kiểm tra tính toàn vẹn và nén (VACUUM) cơ sở dữ liệu SQLite. Chỉ dành cho quản trị viên. Chỉ áp dụng nếu SQLite đang được sử dụng trong backend lưu trữ.  Nếu engine lưu trữ hiện tại không phải là SQLite hoặc không có tệp cơ sở dữ liệu nào, nó sẽ trả về lỗi.

Không có tham số đầu vào. Khi thành công, quá trình tối ưu hóa sẽ chạy dưới dạng một internal job và một báo cáo chi tiết sẽ được tạo ra.

Example response:

```json
{ "code": 0, "id": "imj97z8isl3bqvas" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm một thuộc tính `id`, là ID của internal job (quá trình tối ưu hóa chạy bất đồng bộ trong nền).  Để theo dõi tiến độ của job, hãy thăm dò API [get_internal_jobs](#get_internal_jobs).

### admin_reset_daily_stats

```
POST /api/app/admin_reset_daily_stats/v1
```

Đặt lại các bộ đếm thống kê hàng ngày (biểu đồ ngày trên dashboard). Chỉ dành cho quản trị viên. Điều này cũng đẩy snapshot thống kê hiện tại vào lưu trữ lịch sử và broadcast các thống kê đã làm mới tới người dùng đang kết nối.

Không có tham số đầu vào.

Example response:

```json
{ "code": 0 }
```

### get_transfer_token

```
POST /api/app/get_transfer_token/v1
```

Tạo một token dùng một lần, tồn tại trong thời gian ngắn (60 giây) để ủy quyền cho lệnh gọi truyền dữ liệu tiếp theo (ví dụ: [admin_export_data](#admin_export_data)). Chỉ dành cho quản trị viên.

Tham số: Cùng một payload mà bạn sẽ chuyển đến [admin_export_data](#admin_export_data) (ví dụ: `lists`, `indexes`, `extras`, hoặc `items`). Token này liên kết với session của bạn và các tham số được cung cấp.

Example response:

```json
{ "code": 0, "token": "tme4wxyz9ab" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này trả về một chuỗi `token` để đưa vào một GET tiếp theo.

### admin_stats

```
GET /api/app/admin_stats/v1
```

Trả về các thống kê hệ thống mở rộng cho trang System Status. Chỉ dành cho quản trị viên.

Không có tham số đầu vào.

Ngoài [Standard Response Format](#standard-response-format), phần này trả về một đối tượng `stats` bao gồm:

- `version`: Phiên bản PTOps.
- `node.version`: Phiên bản Node.js.
- `db.sqlite`: Tổng số byte trên ổ đĩa cho DB SQLite + WAL (nếu có).
- `db.records`: Map của ID index → số lượng hàng (ví dụ: `jobs`, `servers`, `snapshots`, `alerts`, `activity`).
- `unbase`: Các thống kê indexer mức thấp.
- `cache`: Các thống kê cache lưu trữ (nếu được bật).
- `sockets`: Các socket người dùng và server đang kết nối kèm siêu dữ liệu (ID, IP, loại, username, server, ping).

Example response:

```json
{ "code": 0, "stats": { "version": "0.0.0", "db": { "sqlite": 123456, "records": { "jobs": 287 } } } }
```

### admin_import_data

```
POST /api/app/admin_import_data/v1
```

Nhập dữ liệu hàng loạt từ một tệp lưu trữ cục bộ. Gửi dưới dạng `multipart/form-data` với một trường tệp duy nhất. Chỉ dành cho quản trị viên. Tệp có thể là văn bản thuần túy hoặc được nén bằng gzip. Quá trình nhập chạy dưới dạng một internal job trong nền; API phản hồi sớm kèm theo ID của job.

Tham số (các trường multipart/form-data):

| Property Name | Type | Description |
|---------------|------|-------------|
| `file` | File | **(Bắt buộc)** Tệp NDJSON để nhập (có thể là `.gz`). Tên trường có thể là tùy ý; chỉ nên bao gồm một tệp. |
| `format` | String | Tùy chọn. `xyops` (mặc định) hoặc `cronicle`. Khi là `cronicle`, server sẽ chuyển đổi các cấu trúc đã biết trước khi nhập. |
| `danger` | Boolean | Tùy chọn. Khi được đặt thành `true`, PTOps sẽ **không** vô hiệu hóa lịch trình cũng như không hủy bất kỳ job nào đang chạy cho việc nhập.  Sử dụng một cách thận trọng. |

Các định dạng dòng NDJSON được hỗ trợ:

- `{ "index": INDEX, "id": ID, "record": { ... } }` để upsert một bản ghi DB.
- `{ "key": KEY, "value": VALUE }` để ghi một khóa lưu trữ (giá trị nhị phân được mã hóa base64).
- `{ "cmd": CMD, "args": [ ... ] }` để thực thi lệnh lưu trữ (ví dụ: `listDelete`).

Example response:

```json
{ "code": 0, "id": "ijobabc123" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm một thuộc tính `id`, là ID của internal job (việc nhập hàng loạt diễn ra bất đồng bộ trong nền).  Để theo dõi tiến độ của job, hãy thăm dò API [get_internal_jobs](#get_internal_jobs).

Ghi chú:

- Bộ lập lịch được tự động tạm dừng cho quá trình nhập, tất cả các job đang xếp hàng được dọn sạch, và các job đang chạy bị hủy trước khi nhập để đảm bảo tính toàn vẹn của dữ liệu.
- Một báo cáo chi tiết được đính kèm vào internal job và gửi qua email cho người dùng đã đưa ra request.
- Sau khi nhập, các danh sách global được tải lại, các monitor/alert được biên dịch lại, và UI được làm mới cho người dùng đang kết nối.

### admin_export_data

```
GET /api/app/admin_export_data/v1
```

Stream một tệp lưu trữ NDJSON được nén bằng gzip của dữ liệu đã chọn tới client. Yêu cầu quyền [bulk_export](privileges.md#bulk_export). Đối với các bản tải xuống trên trình duyệt, trước tiên hãy gọi [get_transfer_token](#get_transfer_token) và sau đó bao gồm `?token=...` trên GET này để ủy quyền và áp dụng các tham số đã được liên kết trước với token.

Tham số (chọn các bộ chọn cấp cao hoặc một mảng `items` tùy chỉnh):

| Property Name | Type | Description |
|---------------|------|-------------|
| `lists` | Array(String) or String | Các ID danh sách từ `config.ui.list_list` hoặc chuỗi hằng `"all"`. Mỗi ID xuất ra danh sách và trang `global/NAME` tương ứng. |
| `indexes` | Array(String) or String | Các ID index cơ sở dữ liệu từ `config.ui.database_list` hoặc `"all"`. Xuất các bản ghi DB phù hợp (mới nhất đến cũ nhất). |
| `extras` | Array(String) or String | Tùy chọn bổ sung hoặc `"all"`. Hỗ trợ: `user_avatars`, `job_files`, `job_logs`, `monitor_data`, `stat_data`. |
| `items` | Array(Object) | Chế độ nâng cao. Mảng các mục xuất ra như `{ type: "list", key }`, `{ type: "index", index, query?, max_rows? }`, `{ type: "users", avatars? }`, `{ type: "jobFiles", query?, max_rows?, max_size?, logs?, files? }`, `{ type: "monitorData", query? }`, `{ type: "bucketData" }`, `{ type: "bucketFiles", max_size? }`, `{ type: "secretData" }`. |
| `token` | String | Token dùng một lần từ [get_transfer_token](#get_transfer_token). Khi có mặt, các tham số từ token được áp dụng và token bị vô hiệu hóa. |

Phản hồi: Một tệp streaming gzip `200 OK`. Nội dung là NDJSON chứa hỗn hợp của:

- `{ "index": INDEX, "id": ID, "record": { ... } }` cho các bản ghi DB.
- `{ "key": KEY, "value": VALUE }` cho các khóa lưu trữ hoặc tệp (giá trị nhị phân được mã hóa base64).

Ghi chú:

- Job log/tệp chỉ được xuất ra nếu dưới 1 MB mỗi tệp.
- Các tệp bucket được xuất ra dưới dạng base64 với một tệp kê khai (manifest) về siêu dữ liệu tệp.
- Dữ liệu secret được xuất ra dưới dạng các giá trị đã mã hóa (như được lưu trữ).
- API key chỉ được xuất ra dưới dạng salted hash (như được lưu trữ).

### admin_delete_data

```
POST /api/app/admin_delete_data/v1
```

Xóa vĩnh viễn hàng loạt dữ liệu đã chọn. Chỉ dành cho quản trị viên. Chạy dưới dạng một internal job trong nền, và biên dịch một báo cáo với số lượng và bất kỳ lỗi/cảnh báo nào.  Nếu request xóa được gửi bởi người dùng, báo cáo sẽ được gửi qua email đến địa chỉ email của người dùng.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `items` | Array(Object) | **(Bắt buộc)** Mảng các action xóa. Các loại được hỗ trợ: `{ type: "list", key }`, `{ type: "index", index, query? }`, `{ type: "users" }`, `{ type: "bucketData" }`, `{ type: "bucketFiles" }`, `{ type: "secretData" }`. |

Example request:

```json
{ "items": [ { "type": "users" }, { "type": "list", "key": "global/stats" }, { "type": "index", "index": "jobs" } ] }
```

Example response:

```json
{ "code": 0, "id": "imj97z8isl3bqvas" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm một thuộc tính `id`, là ID của internal job (việc xóa hàng loạt diễn ra bất đồng bộ trong nền).  Để theo dõi tiến độ của job, hãy thăm dò API [get_internal_jobs](#get_internal_jobs).

Ghi chú:

- Bộ lập lịch được tự động tạm dừng cho các thao tác xóa.
- Một số loại thực hiện dọn dẹp sâu trước tiên (ví dụ: `users` loại bỏ ảnh đại diện và security log; các loại xóa bucket loại bỏ dữ liệu và tệp trước khi danh sách `global/buckets` bị thay đổi).

### admin_logout_all

```
POST /api/app/admin_logout_all/v1
```

Đăng xuất tất cả các session đang hoạt động cho một người dùng cụ thể và hủy cấp phép bất kỳ socket nào đang kết nối. Chỉ dành cho quản trị viên. Thực thi như một internal job; trả về ngay lập tức.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `username` | String | **(Bắt buộc)** Tên người dùng cần đăng xuất. |

Example request:

```json
{ "username": "jdoe" }
```

Example response:

```json
{ "code": 0, "id": "imj97z8isl3bqvas" }
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm một thuộc tính `id`, là ID của internal job (việc đăng xuất hàng loạt diễn ra bất đồng bộ trong nền).  Để theo dõi tiến độ của job, hãy thăm dò API [get_internal_jobs](#get_internal_jobs).

### admin_search_logs

```
POST /api/app/admin_search_logs/v1
```

Tìm kiếm các tệp system log PTOps cục bộ (hiện tại hoặc đã lưu trữ) và trả về các hàng khớp. Chỉ dành cho quản trị viên.

Tham số:

| Property Name | Type | Description |
|---------------|------|-------------|
| `log` | String | **(Bắt buộc)** Tên log cần tìm kiếm, ví dụ: `PTOps`. Phải khớp với một trong các tên tệp log chuẩn, không có phần mở rộng. |
| `rows` | Number | **(Bắt buộc)** Số hàng tối đa để trả về, từ `1` đến `1000`. API giữ lại N hàng khớp cuối cùng từ tệp. |
| `match` | String | Tùy chọn. Văn bản hoặc mẫu để tìm kiếm. Nếu bỏ qua, tất cả các hàng đều khớp. |
| `regex` | Boolean | Tùy chọn. Nếu `true`, diễn giải `match` dưới dạng biểu thức chính quy. |
| `case` | Boolean | Tùy chọn. Nếu `true`, tìm kiếm phân biệt chữ hoa chữ thường. |
| `cols` | Array(String) or String | Tùy chọn. Các cột để trả về, dưới dạng mảng hoặc danh sách phân tách bằng dấu phẩy. Mặc định là tất cả [log_columns](config.md#log_columns). |
| `date` | String | Tùy chọn. Ngày theo định dạng `YYYY-MM-DD`. Nếu bỏ qua, sẽ tìm kiếm log trực tiếp hiện tại. Nếu được thiết lập, sẽ tìm kiếm log đã lưu trữ cho ngày đó. |

Example request:

```json
{
	"log": "PTOps",
	"match": "ERROR",
	"rows": 100,
	"cols": "hires_epoch,category,code,msg,data",
	"case": 0,
	"regex": 0,
	"date": "2026-01-31"
}
```

Example response:

```json
{
	"code": 0,
	"rows": [
		{
			"hires_epoch": 1769812345.123,
			"category": "server",
			"code": "error",
			"msg": "Failed to connect to storage",
			"data": "{\"error\":\"ECONNREFUSED\"}"
		}
	],
	"list": { "length": 8924 }
}
```

Ngoài [Standard Response Format](#standard-response-format), phần này bao gồm:

- `rows`: Mảng các đối tượng hàng chỉ với các cột được yêu cầu.
- `list.length`: Tổng số hàng trong tệp log (không phải số lượng kết quả khớp).

Ghi chú:

- Nếu việc lưu trữ không được cấu hình hoặc thiếu tệp cho một `date` đã cho, API trả về mảng `rows` trống.
- Các ID cột hợp lệ đến từ [log_columns](config.md#log_columns) (ví dụ: `hires_epoch`, `date`, `hostname`, `pid`, `component`, `category`, `code`, `msg`, `data`).
### admin_get_config

```
GET /api/app/admin_get_config/v1
```

Lấy toàn bộ cấu hình PTOps cho giao diện quản trị viên. Chỉ dành cho admin.

Không có tham số đầu vào.

Ngoài [Standard Response Format](#standard-response-format), API này trả về:

- `config`: Đối tượng cấu hình hiện tại với các khóa nhạy cảm đã bị xóa (`secret_key`, `SSO`, `Debug`, `config_overrides_file`).
- `overrides`: Đối tượng ghi đè cấu hình hiện tại (sparse), với các khóa dành riêng đã bị xóa.
- `markdown`: Nội dung của `docs/config.md` được UI sử dụng để xây dựng trình chỉnh sửa.

Example response:

```json
{
	"code": 0,
	"config": { "ui": { "log_files": ["PTOps"] }, "storage": { "engine": "Filesystem" } },
	"overrides": { "ui.log_files": ["PTOps", "PTOps-plugins"] },
	"markdown": "# Configuration\n\n..."
}
```

Đáng chú ý, phản hồi bỏ qua các thuộc tính được bảo vệ / dành riêng bao gồm `secret_key`, `SSO`, `Debug`, và `config_overrides_file`, do tính chất nhạy cảm của chúng.

### admin_update_config

```
POST /api/app/admin_update_config/v1
```

Cập nhật các ghi đè cấu hình, lưu chúng vào đĩa và tải lại các cài đặt mới ngay lập tức. Chỉ dành cho admin. Yêu cầu là một danh sách thưa thớt (sparse) các ghi đè được hợp nhất vào cấu hình trực tiếp.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| (Other) | Various | Bất kỳ khóa ghi đè cấu hình nào, sử dụng cùng tên đường dẫn như `docs/config.md` (ví dụ `ui.log_files` hoặc `storage.engine`). Các giá trị sẽ thay thế giá trị hiện tại tại đường dẫn đó. |

Example request:

```json
{
	"ui.log_files": ["PTOps", "PTOps-plugins"],
	"storage.engine": "Filesystem"
}
```

Example response:

```json
{ "code": 0 }
```

Notes:

- Ghi đè có tính chất cộng dồn. Chỉ những đường dẫn bạn bao gồm mới được cập nhật.
- Các khóa dành riêng không thể được đặt thông qua API này: `secret_key`, `SSO`, `Debug`, `config_overrides_file`.
- Một số cài đặt có thể yêu cầu khởi động lại toàn bộ server để có hiệu lực (ví dụ: thay đổi cổng web server).

### get_api_keys

```
GET /api/app/get_api_keys/v1
```

Lấy tất cả API Keys. Chỉ dành cho admin. Không có tham số đầu vào.

Ngoài [Standard Response Format](#standard-response-format), API này bao gồm một mảng `rows` chứa các đối tượng [APIKey](data.md#apikey) và một đối tượng `list` với siêu dữ liệu danh sách.

Example response:

```json
{ "code": 0, "rows": [ { "id": "k1", "title": "My App", "key": "rPEu2GRpK3TPgVnmSFVPFTT9", "active": 1 } ], "list": { "length": 1 } }
```

### get_api_key

```
GET /api/app/get_api_key/v1
```

Lấy một API Key đơn lẻ theo ID. Chỉ dành cho admin. Hỗ trợ HTTP GET với các tham số truy vấn hoặc HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID API Key cần lấy. |

Example response:

```json
{ "code": 0, "api_key": { "id": "k1", "title": "My App", "key": "rPEu2GRpK3TPgVnmSFVPFTT9", "active": 1 } }
```

Ngoài [Standard Response Format](#standard-response-format), API này bao gồm một đối tượng `api_key`. Xem [APIKey](data.md#apikey) để biết chi tiết các trường.

### create_api_key

```
POST /api/app/create_api_key/v1
```

Tạo một API Key mới. Chỉ dành cho admin. Gửi dưới dạng HTTP POST với JSON. Các trường `id`, `username`, `created`, `modified` và `revision` được tự động tạo bởi server.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `title` | String | **(Required)** Tiêu đề hiển thị cho API Key. |
| `key` | String | **(Required)** Chuỗi API Key (tối thiểu 16 ký tự). |
| (Other) | Various | Tùy chọn. Các trường [APIKey](data.md#apikey) như `active`, `description`, `privileges`, `roles`. |

Example request:

```json
{
  "title": "Build Bot",
  "key": "muJm8T6QSzqQzuO6MvbOdtlB",
  "active": 1,
  "privileges": { "run_jobs": 1, "admin": 1 },
  "roles": []
}
```

Example response:

```json
{ "code": 0, "api_key": { /* metadata */ }, "plain_key": "API_KEY_HERE" }
```

Ngoài [Standard Response Format](#standard-response-format), API này bao gồm một đối tượng `api_key` (xem [APIKey](data.md#apikey)), cũng như giá trị thực tế của API key trong một thuộc tính có tên là `plain_key`. Đây là lần **duy nhất** giá trị bí mật của API key được gửi qua mạng, vì nó được lưu trữ dưới định dạng đã mã hóa (hashed) và không bao giờ có thể được lấy lại sau đó.

### update_api_key

```
POST /api/app/update_api_key/v1
```

Cập nhật một API Key hiện có theo ID. Chỉ dành cho admin. Gửi dưới dạng HTTP POST với JSON. Yêu cầu được shallow-merge (hợp nhất nông) vào key hiện tại; `modified` và `revision` được cập nhật tự động. Giá trị thực tế của `key` không thể bị thay đổi.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID API Key cần cập nhật. |
| (Other) | Various | Bất kỳ trường [APIKey](data.md#apikey) nào có thể cập nhật ngoại trừ `key`. |

Example request:

```json
{ "id": "k1", "title": "Build Bot (prod)", "active": 0 }
```

Example response:

```json
{ "code": 0 }
```

### delete_api_key

```
POST /api/app/delete_api_key/v1
```

Xóa một API Key hiện có theo ID. Chỉ dành cho admin. Hành động này là vĩnh viễn.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | **(Required)** ID API Key cần xóa. |

Example request:

```json
{ "id": "k1" }
```

Example response:

```json
{ "code": 0 }
```



### admin_upgrade_masters

```
POST /api/app/admin_upgrade_masters/v1
```

Bắt đầu một job dưới nền để nâng cấp một hoặc nhiều conductor server. Chỉ dành cho admin. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `targets` | Array(String) | **(Required)** Một hoặc nhiều host ID của conductor đang trực tuyến để nâng cấp. |
| `release` | String | **(Required)** Selector của bản phát hành để cài đặt. Sử dụng `latest` cho bản phát hành ổn định mới nhất, hoặc truyền một tag PTOps rõ ràng như `v1.2.3`. Có thể lấy các giá trị khả dụng từ [get_master_releases](#get_master_releases). |
| `stagger` | Number | **(Required)** Thời gian trì hoãn (giây) giữa việc gửi lệnh nâng cấp đến mỗi conductor từ xa. Sử dụng `0` để không có trì hoãn. |

Example request:

```json
{
	"targets": ["conductor-b", "conductor-a"],
	"release": "latest",
	"stagger": 60
}
```

Example response:

```json
{ "code": 0 }
```

Notes:

- API trả về ngay sau khi internal job được đưa vào hàng đợi.
- Nếu primary conductor hiện tại được bao gồm trong `targets`, PTOps sẽ nâng cấp tất cả các backup conductor được chọn trước, sau đó nâng cấp primary cục bộ sau cùng dưới nền. Kết nối client của bạn thường sẽ bị ngắt khi primary bắt đầu tự nâng cấp.
- Chỉ những backup conductor hiện đang trực tuyến mới đủ điều kiện cho việc điều phối từ xa. Các conductor ngoại tuyến hoặc conductor đang chạy trong chế độ debug sẽ bị bỏ qua và được ghi chú trong chi tiết internal job.
- API này không khả dụng trong [Air-Gapped Mode](hosting.md#air-gapped-mode) và trả về lỗi nếu air-gap được bật.
- Nếu một maintenance internal job đã đang chạy, API này trả về lỗi thay vì bắt đầu nâng cấp.

### admin_upgrade_workers

```
POST /api/app/admin_upgrade_workers/v1
```

Bắt đầu một job dưới nền để nâng cấp một hoặc nhiều worker server. Chỉ dành cho admin. Gửi dưới dạng HTTP POST với JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `targets` | Array(String) | **(Required)** Một hoặc nhiều worker server ID và/hoặc server group ID. Group ID được mở rộng thành các worker hiện đang kết nối trong nhóm và các kết quả trùng lặp tự động bị loại bỏ. |
| `release` | String | **(Required)** Selector của bản phát hành để cài đặt trên các worker, thường là `latest`, `airgap`, hoặc một tag xySat rõ ràng như `v0.9.50`. Có thể lấy các giá trị khả dụng từ [get_satellite_releases](#get_satellite_releases). |
| `stagger` | Number | **(Required)** Thời gian trì hoãn (giây) giữa việc gửi lệnh nâng cấp đến mỗi worker. Sử dụng `0` để không có trì hoãn. |

Example request:

```json
{
	"targets": ["main", "build-worker-01"],
	"release": "latest",
	"stagger": 30
}
```

Example response:

```json
{ "code": 0 }
```

Notes:

- API trả về ngay sau khi internal job được đưa vào hàng đợi.
- Chỉ những worker hiện đang kết nối tại thời điểm điều phối mới được bao gồm. Nếu không có worker đang hoạt động nào khớp với lựa chọn mục tiêu, API trả về lỗi.
- Bản phát hành đã chọn được lưu vào [satellite.version](config.md#satelliteversion) trước khi điều phối để menu thả xuống được điền sẵn trong lần truy cập tiếp theo.
- PTOps gửi cho mỗi worker một lệnh nâng cấp và worker tự thực hiện việc nâng cấp. Các job đang chạy được phép hoàn thành trước, do đó quá trình nâng cấp được thiết kế để tránh làm gián đoạn công việc đang hoạt động trên server.
- Nếu một maintenance internal job đã đang chạy, API này trả về lỗi thay vì bắt đầu nâng cấp.



## Multi

### master_register

```
POST /api/app/master_register/v1
```

Chỉ sử dụng nội bộ. Endpoint này là một phần của luồng bầu cử và đăng ký đa conductor (multi-conductor), được sử dụng bởi các conductor để khám phá primary hiện tại và xác thực các máy ngang hàng. Nó **không** sử dụng user session hoặc API Key. Thay vào đó, việc xác thực ngang hàng được thực hiện bằng một mã băm mật mã (cryptographic hash) của [secret_key](config.md#secret_key) dùng chung.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `host` | String | **(Required)** Host ID của conductor đang cố gắng đăng ký. Đây phải chỉ là hostname của conductor, không bao gồm port. |
| `auth` | String | **(Required)** Mã băm SHA-256 hệ thập lục phân in thường của `host + secret_key`. |

Example request:

```json
{
	"host": "xyops02.internal.example.com",
	"auth": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
}
```

Example response:

```json
{
	"code": 0,
	"master": true
}
```

Ngoài [Standard Response Format](#standard-response-format), API này trả về một giá trị boolean `master` cho biết conductor được liên hệ hiện có phải là primary hay không.

Notes:

- Endpoint này có thể được gọi trên primary hoặc backup conductor.
- Nếu conductor mục tiêu là primary và `host` yêu cầu chưa hiện diện trong danh sách cluster master, máy ngang hàng đó sẽ tự động được thêm vào cluster.
- Nếu conductor yêu cầu liên hệ với chính nó, API trả về lỗi `duplicate`. Điều này thường chỉ ra có các mục nhập trùng lặp trong `masters.json` (hoặc tập tin danh sách multi master được cấu hình).
- Nếu secret dùng chung không khớp, API trả về lỗi `auth`.

### get_master_releases

```
GET /api/app/get_master_releases/v1
```

Lấy danh sách các release tag PTOps chính thức từ origin được cấu hình trong [multi](config.md#multi) (thường là GitHub). Yêu cầu có user session hoặc API Key hợp lệ.

API này chấp nhận một tham số tùy chọn `verbose`. Nếu được đặt là `true`, nó sẽ bao gồm toàn bộ phản hồi từ nhà cung cấp upstream trong một thuộc tính `data`.

Example response:

```json
{
	"code": 0,
	"releases": ["latest", "v1.2.3", "v1.2.2"]
}
```

Ngoài [Standard Response Format](#standard-response-format), API này trả về một mảng `releases`. Phần tử đầu tiên luôn là `latest`, theo sau là các release tag được phát hiện. Nếu `verbose` được chỉ định, một đối tượng `data` cũng sẽ được bao gồm, chứa toàn bộ phản hồi của nhà cung cấp upstream.

Notes:

- API này sử dụng release metadata URL được cấu hình từ cài đặt [multi](config.md#multi), điển hình là GitHub.
- Các phản hồi có thể được lưu trữ (cache), sử dụng `multi.cache_ttl` nếu được cấu hình, hoặc mặc định `3600` giây.
- Endpoint này được sử dụng bởi Conductors và System admin UI để làm nổi bật các conductor đã lỗi thời và cung cấp dữ liệu cho các menu nâng cấp.
- Một canned response (phản hồi được lập trình sẵn) sẽ được trả về nếu [Air-Gapped Mode](hosting.md#air-gapped-mode) được kích hoạt.

### master_command

```
POST /api/app/master_command/v1
```

Gửi một lệnh điều khiển đến một conductor server. Chỉ dành cho admin. Yêu cầu có administrator session hoặc API Key hợp lệ. Yêu cầu phải được gửi dưới dạng HTTP POST với nội dung JSON.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `host` | String | **(Required)** Host ID của conductor mục tiêu. Đây phải chỉ là hostname của conductor, không bao gồm port. |
| `commands` | Array(String) | **(Required)** Mảng các lệnh để chạy. Phần tử đầu tiên phải là một trong `stop` (tắt), `restart`, `upgrade`, hoặc `remove`. Đối với `upgrade`, phần tử thứ hai tùy chọn có thể chỉ định một release tag như `v1.2.3`; nếu không, bản phát hành ổn định mới nhất sẽ được sử dụng. |

Example request:

```json
{
	"host": "xyops02.internal.example.com",
	"commands": ["restart"]
}
```

Example response:

```json
{
	"code": 0
}
```

Notes:

- API trả về sau khi lệnh được điều phối. Nó không chờ đợi conductor từ xa hoàn thành việc khởi động lại, tắt hoặc nâng cấp.
- Các lệnh không phải `remove` yêu cầu backup conductor mục tiêu đang trực tuyến. Nếu không API trả về lỗi.
- Nếu `host` khớp với primary conductor hiện tại, lệnh được thực thi cục bộ. Tuy nhiên, lệnh `remove` bị từ chối đối với primary hiện tại.
- Lệnh `remove` cập nhật danh sách cluster master ngay lập tức, và nếu conductor mục tiêu đang trực tuyến, PTOps trước tiên gửi cho nó lệnh `stop` trước khi xóa nó khỏi cluster.
- Các lệnh cục bộ cuối cùng được thực thi thông qua `bin/control.sh`, và các tham số lệnh được làm sạch (sanitized) trước khi thực thi.



## Satellite

Các API này xử lý việc khởi tạo (bootstrap), cài đặt, nâng cấp và khám phá bản phát hành của xySat. Khác với hầu hết các API PTOps, nhóm endpoint `satellite` phục vụ các script văn bản thuần túy, tệp tin nén (tarball) và tệp tin JSON config thay vì bao bọc (envelope) phản hồi JSON chuẩn khi thành công.

### get_satellite_token

```
POST /api/app/get_satellite_token/v1
```

Tạo một satellite bootstrap token có thời hạn ngắn để sử dụng với nhóm API [satellite](#satellite). Yêu cầu có user session hoặc API Key hợp lệ với đặc quyền [add_servers](privileges.md#add_servers).

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `expires` | Number | Tùy chọn. Thời gian sống (lifetime) của token tính bằng giây. Mặc định là `86400` (24 giờ). |
| `title` | String | Tùy chọn. Tiêu đề / nhãn ban đầu được gán cho server trong lần kết nối đầu tiên. |
| `enabled` | Boolean | Tùy chọn. Trạng thái kích hoạt (enabled) ban đầu cho bản ghi của server. |
| `icon` | String | Tùy chọn. Biểu tượng ban đầu cho bản ghi của server. |
| `groups` | Array(String) | Tùy chọn. Các server group ban đầu. Các mảng rỗng sẽ bị bỏ qua. |
| (Other) | Various | Tùy chọn. Thêm các metadata ban đầu của server để nhúng vào bootstrap token. |

Example request:

```json
{
	"title": "Build Worker 01",
	"enabled": 1,
	"icon": "server",
	"groups": ["build", "linux"],
	"expires": 3600
}
```

Example response:

```json
{
	"code": 0,
	"token": "tme4wxyz9ab",
	"base_url": "https://xyops01.example.com",
	"image": "ghcr.io/pixlcore/xysat",
	"version": "latest"
}
```

Ngoài [Standard Response Format](#standard-response-format), API này trả về:

- `token`: Bootstrap token dựa trên thời gian được tạo ra.
- `base_url`: URL cơ sở (base URL) để sử dụng cho yêu cầu bootstrap.
- `image`: Tên image của xySat container được cấu hình.
- `version`: Release tag xySat được cấu hình để cài đặt.

Notes:

- Token trả về được dùng để xác thực các yêu cầu satellite bootstrap qua tham số truy vấn `t`.
- `base_url`, `image`, và `version` xuất phát từ cấu hình [satellite](config.md#satellite) của conductor.
- Bootstrap token mang metadata ban đầu của server, sau đó được ghi vào satellite config được tạo ra dưới khóa `initial`.

### get_satellite_releases

```
GET /api/app/get_satellite_releases/v1
```

Lấy danh sách các release tag xySat chính thức từ origin được cấu hình trong [satellite](config.md#satellite) (thường là GitHub). Yêu cầu có user session hoặc API Key hợp lệ.

API này chấp nhận một tham số tùy chọn `verbose`. Nếu được đặt là `true`, nó sẽ bao gồm toàn bộ phản hồi từ nhà cung cấp upstream trong một thuộc tính `data`.

Example response:

```json
{
	"code": 0,
	"releases": ["latest", "v0.9.50", "v0.9.49"]
}
```

Ngoài [Standard Response Format](#standard-response-format), API này trả về một mảng `releases`. Phần tử đầu tiên luôn là `latest`, theo sau là các release tag được phát hiện. Nếu `verbose` được chỉ định, một đối tượng `data` cũng sẽ được bao gồm, chứa toàn bộ phản hồi của nhà cung cấp upstream.

Notes:

- API này sử dụng release metadata URL, điển hình là GitHub, từ cài đặt [satellite](config.md#satellite).
- Các quy tắc về air-gap được tôn trọng. Nếu air-gap mode được kích hoạt và một satellite bucket được cấu hình, API sẽ trả về `["airgap"]` thay vì truy vấn từ upstream.

### satellite

```
GET /api/app/satellite/install?t=...
GET /api/app/satellite/upgrade?s=...&t=...
GET /api/app/satellite/core?t=...&os=...&arch=...
GET /api/app/satellite/config?t=...
```

Khởi tạo (bootstrap) hoặc nâng cấp xySat trên các hệ thống từ xa. Nhóm endpoint này được sử dụng nội bộ bởi luồng "Add Server", hệ thống nâng cấp worker, Docker bootstrap, và tính năng tự nâng cấp xySat.

Authentication:

- Bootstrap token: Truyền một token dựa trên thời gian từ [get_satellite_token](#get_satellite_token) vào tham số truy vấn `t`.
- Server token: Truyền auth token vĩnh viễn của server vào `t` và ID server vào `s`. Token này được dùng cho mục đích tự nâng cấp và chỉ được chấp nhận đối với các server đang hoạt động (active) hoặc mới hoạt động gần đây.
- API Key: Truyền một API Key có đặc quyền [add_servers](privileges.md#add_servers) vào `t`. API này chủ yếu dành cho triển khai tự động và hạ tầng tạm thời (ephemeral infrastructure).

Common query parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `t` | String | **(Required)** Token xác thực. Đây có thể là bootstrap token, server auth token, hoặc API Key. |
| `s` | String | Bắt buộc đối với `/upgrade`, và cũng như khi xác thực bằng server auth token. Đây là Server ID. |
| `os` | String | Tùy chọn đối với `/install` để chọn Windows PowerShell script. Bắt buộc đối với `/core` để chọn package đúng, ví dụ `linux`, `darwin`, hoặc `windows`. |
| `arch` | String | Bắt buộc đối với `/core` để chọn kiến trúc package đúng, ví dụ `x64` hoặc `arm64`. |

Sub-methods:

- `/api/app/satellite/install`: Trả về một bootstrap script dưới dạng văn bản thuần túy (`text/plain`). Dùng `os=windows` để lấy bộ cài PowerShell; ngược lại, một POSIX shell script sẽ được trả về. Khi được xác thực bằng bootstrap token, bất kỳ tham số truy vấn bổ sung nào ngoài `t` và `os` sẽ được gộp vào metadata ban đầu của server trước khi cấu hình được tạo.
- `/api/app/satellite/upgrade`: Trả về một upgrade script dưới dạng văn bản thuần túy (`text/plain`). Yêu cầu `s` và `t`. Dùng `os=windows` để lấy kịch bản nâng cấp PowerShell; ngược lại, một POSIX shell script sẽ được trả về.
- `/api/app/satellite/core`: Trả về tệp tin nén (tarball) của xySat (`application/gzip`) với một tên tập tin tải xuống dạng `satellite-OS-ARCH.tar.gz`. Nếu một satellite bucket được cấu hình, tệp được cung cấp từ đó. Ngược lại, PTOps dùng bộ đệm (cache) cục bộ và tìm nạp từ upstream release base URL được cấu hình khi cần thiết.
- `/api/app/satellite/config`: Trả về một tệp `config.json` được tạo (`application/json`). Tệp này bao gồm `satellite.config` của conductor, các cài đặt air-gap nếu chưa có, máy chủ (host) và cổng (port) của master hiện tại, một `server_id` mới được tạo, một `auth_token` được dẫn xuất (derived), và bất kỳ metadata bootstrap ban đầu nào dưới khóa `initial`.

Example bootstrap commands:

```sh
curl -s "https://xyops01.example.com/api/app/satellite/install?t=TOKEN_HERE" | sudo sh
```

```powershell
powershell -Command "IEX (Invoke-WebRequest -UseBasicParsing -Uri 'https://xyops01.example.com/api/app/satellite/install?t=TOKEN_HERE&os=windows').Content"
```

Example `config` response:

```json
{
	"port": 5522,
	"secure": false,
	"hosts": ["xyops01.example.com"],
	"server_id": "sabc123def",
	"auth_token": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
	"initial": {
		"title": "Build Worker 01",
		"groups": ["build", "linux"]
	}
}
```

Notes:

- Các phản hồi thành công là các tập tin được stream hoặc văn bản thuần túy, tùy thuộc vào phương thức phụ. Nếu có lỗi, định dạng JSON API error tiêu chuẩn sẽ được trả về.
- `/config` tạo ra một `server_id` và `auth_token` mới trong mỗi yêu cầu, đó là lý do tại sao bootstrap URL sử dụng API Key có thể được tái sử dụng để cung cấp các ephemeral worker (worker tạm thời).
- `/core` và các yêu cầu release metadata tôn trọng cài đặt air-gap.



## Miscellaneous

### ping

```
GET /api/app/ping/v1
```

Endpoint kiểm tra tình trạng (health check) đơn giản. Trả về thành công nếu có thể tiếp cận được API.

Notes:

- Endpoint công khai; không yêu cầu xác thực.

Example response:

```json
{ "code": 0 }
```

### echo

```
GET /api/app/echo/v1
POST /api/app/echo/v1
```

Endpoint phân tích chuẩn đoán (diagnostic endpoint) phản hồi (echo) các chi tiết yêu cầu. Hữu ích cho việc kiểm tra kết nối, headers, cookies, phân tích cú pháp tham số, và tải lên nhiều phần (multipart uploads). Phản hồi không bao gồm trường `code` tiêu chuẩn.

Parameters:

| Property Name | Type | Description |
|---------------|------|-------------|
| `sleep` | Number | Độ trễ tùy chọn tính bằng mili-giây trước khi phản hồi. Mặc định là `1`. |
| `pretty` | Number | Tùy chọn. Nếu được đặt thành `1` sẽ định dạng hiển thị cho phản hồi JSON. |

Notes:

- Endpoint công khai; không yêu cầu xác thực.
- Trả về một đối tượng JSON với các trường sau: `method`, `uri`, `ips`, `headers`, `cookies`, `params`, `files`.

Example response (truncated):

```json
{
  "method": "GET",
  "uri": "/api/app/echo/v1?sleep=250",
  "ips": ["203.0.113.10"],
  "headers": { "host": "example.xyops.io", "user-agent": "curl/8.4.0" },
  "cookies": {},
  "params": { "sleep": 250 },
  "files": {}
}
```

### error

```
GET /api/app/error/v1
```

Mô phỏng một phản hồi lỗi để kiểm tra quá trình xử lý lỗi ở phía client.

Notes:

- Endpoint công khai; không yêu cầu xác thực.
- Luôn phản hồi bằng một lỗi mô phỏng (test error) sử dụng [Standard Response Format](#standard-response-format).

Example error response:

```json
{
  "code": "test",
  "description": "This is a test error message."
}
```
### dash_stats

```
GET /api/app/dash_stats/v1
```

Trả về số liệu thống kê dashboard trực tiếp từ conductor chính, bao gồm số lượng hoạt động trong ngày hiện tại, số liệu bộ nhớ và CPU, số liệu thống kê engine cơ sở dữ liệu (Unbase) và số liệu thống kê cache lưu trữ tùy chọn.

Ghi chú:

- Yêu cầu phiên người dùng hoặc API Key hợp lệ.
- Chỉ dành cho conductor chính. Nếu được gọi trên một conductor phụ và các chuyển hướng được bật, một chuyển hướng `302` đến conductor chính có thể được trả về.
- Không có tham số đầu vào.

Ví dụ phản hồi:

```json
{
  "code": 0,
  "stats": {
    "day": {
      "timeStart": 1765913097,
      "transactions": {
        "server_add": 6,
        "apikey_update": 4,
        "role_create": 1,
        "state_update": 6,
        "internal_job": 2
      },
      "servers": {},
      "groups": {},
      "requests": 345,
      "bytes_in": 191220,
      "bytes_out": 4225720
    },
    "mem": 106430464,
    "cpu": 0.469576446027293,
    "unbase": {
      "version": "3.2.8",
      "engine": "Hybrid",
      "concurrency": 32,
      "transactions": true,
      "last_second": {},
      "last_minute": {
        "get": { "min": 0.048, "max": 1.131, "total": 6.229, "count": 35, "avg": 0.177 },
        "commit": { "min": 6.866, "max": 17.996, "total": 53.544, "count": 4, "avg": 13.386 },
        "put": { "min": 0.37, "max": 9.712, "total": 23.038, "count": 9, "avg": 2.559 }
      },
      "recent_events": {},
      "queue": { "active": 0, "pending": 0 },
      "locks": {},
      "jobs": {}
    },
    "cache": {}
  }
}
```

### config

```
GET /api/app/config/v1
```

API này được sử dụng để "bootstrap" giao diện người dùng PTOps. Nó trả về một tập hợp dữ liệu ban đầu khi trang tải lần đầu. Nó cũng kích hoạt mã UI front-end để khởi tạo và hiển thị trang.

Phản hồi là một lệnh gọi hàm JavaScript tùy chỉnh không thể thay đổi:

```js
app.receiveConfig({ code: 0, /* other data */ });
```

Dữ liệu được truyền vào hàm `app.receiveConfig` sẽ chứa các thuộc tính sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `code` | Number | Số 0 cho thành công, bất kỳ giá trị nào khác cho lỗi. |
| `version` | String | Phiên bản PTOps hiện tại đang chạy trên server conductor. |
| `epoch` | Number | Ngày/giờ Unix hiện tại trên server conductor. |
| `port` | Number | Cổng web server hiện đang được UI sử dụng. |
| `config` | Object | Đối tượng cấu hình [client](config.md#client), với nhiều bit khác được hợp nhất vào. |
| `masters` | Array | Một mảng các đối tượng [Conductor](data.md#conductor), một cho mỗi server conductor trong cụm. |

### form_config

```
GET /api/app/form_config/v1/TOKEN
```

Một phiên bản đặc biệt của API [config](#config), được tạo riêng cho [Magic Link Triggers](triggers.md#magic-link), cụ thể là trang đích (xem [form](#form)). API này chứa các hướng dẫn đặc biệt để tải trang đích magic thay vì giao diện người dùng PTOps chính, và nó bỏ qua nhiều thuộc tính dài dòng có trong API [config](#config).

Phản hồi là một lệnh gọi hàm JavaScript tùy chỉnh không thể thay đổi:

```js
app.receiveConfig({ code: 0, /* other data */ });
```

### send_email

```
POST /api/app/send_email/v1
```

Gửi một email tùy chỉnh theo yêu cầu với các tệp đính kèm tùy chọn. Yêu cầu một phiên người dùng hoặc API Key hợp lệ với đặc quyền [send_emails](privileges.md#send_emails).

Khi thuộc tính cấu hình toàn cục [email_format](config.md#email_format) được đặt thành `html` (mặc định), điều này sẽ gửi một email sử dụng mẫu HTML PTOps chính thức (với tiêu đề, hình ảnh logo, title, nút, chân trang, bản quyền, phiên bản, viền). Trong trường hợp này, văn bản `body` bạn chỉ định phải là định dạng [GitHub-flavored Markdown](https://github.github.com/gfm/) hoặc HTML và được hiển thị bên trong hộp trình bày mẫu chính. Tuy nhiên, khi [email_format](config.md#email_format) được đặt thành `text`, body của bạn phải là văn bản thuần túy và được gửi nguyên văn (với chân trang văn bản một dòng chứa phiên bản, bản quyền, v.v.).

Email luôn được gửi từ thuộc tính cấu hình toàn cục [email_from](config.md#email_from).

**Định dạng đầu vào:**

- JSON thuần túy: Gửi `Content-Type: application/json` với một body JSON.
- Multipart form-data (để tải lên tệp): Gửi `Content-Type: multipart/form-data` và bao gồm một trường `json` chứa toàn bộ payload JSON (dưới dạng chuỗi), cộng với một hoặc nhiều trường tệp. Tất cả các tệp được tải lên được đính kèm vào email.

**Các tham số:**

| Property Name | Type | Description |
|---------------|------|-------------|
| `to` | String | **(Bắt buộc)** Các địa chỉ email để gửi đến, cách nhau bằng dấu phẩy. |
| `subject` | String | **(Bắt buộc)** Dòng tiêu đề email. |
| `body` | String | **(Bắt buộc)** Văn bản body của email, ở định dạng markdown hoặc HTML. |
| `cc` | String | Danh sách địa chỉ carbon-copy `Cc` tùy chọn, cách nhau bằng dấu phẩy. |
| `bcc` | String | Danh sách địa chỉ blind-carbon-copy `Bcc` tùy chọn, cách nhau bằng dấu phẩy. |
| `title` | String | "title" tùy chọn được hiển thị bằng phông chữ in đậm lớn bên cạnh logo (chỉ dành cho email HTML). |
| `button` | String | Nút có thể nhấp tùy chọn được hiển thị ở góc trên cùng bên phải (chỉ dành cho email HTML). |
| `headers` | Object | Các header MIME tùy chọn để gửi cùng với email, ví dụ: `{ "Importance": "High", "X-Priority": "1", "X-MSMail-Priority": "High" }`. |

Đối với tham số `button` tùy chọn, vui lòng sử dụng cú pháp này: `LABEL | URL`. Vì vậy, ví dụ: `Visit Disney | https://disney.com`.

**Ví dụ:** POST JSON thuần túy (không có tệp)

```json
{
    "to": "test@example.com",
    "subject": "This is a test email",
	"body": "Hello this is *markdown*.\n\nBye!"
}
```

**Ví dụ:** multipart/form-data với các tệp đính kèm

```
POST /api/app/send_email/v1
Content-Type: multipart/form-data; boundary=----XYZ

------XYZ
Content-Disposition: form-data; name="json"

{ "to": "test@example.com", "subject": "This is a test email", "body": "Hello this is *markdown*.\n\nBye!" }
------XYZ
Content-Disposition: form-data; name="file1"; filename="input.csv"
Content-Type: text/csv

id,value\n1,alpha\n2,beta\n
------XYZ
Content-Disposition: form-data; name="file2"; filename="notes.txt"
Content-Type: text/plain

hello world
------XYZ--
```

**Ví dụ phản hồi:**

```json
{
    "code": 0,
    "details": "Mailer debug log contents..." 
}
```

Ngoài [Định dạng phản hồi tiêu chuẩn](#standard-response-format), điều này sẽ bao gồm một thuộc tính `details` chứa nhật ký gỡ lỗi của trình gửi thư (hữu ích cho việc khắc phục sự cố).

**Lưu ý:** API này bị giới hạn tỷ lệ bởi thuộc tính cấu hình [max_emails_per_day](config.md#max_emails_per_day). Nếu vượt quá, nó sẽ thất bại với một lỗi.
