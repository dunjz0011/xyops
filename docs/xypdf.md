# Định Dạng Portable Data của PTOps

## Tổng Quan

Tài liệu này mô tả **Định Dạng Portable Data của PTOps** (XYPDF) v1.0, là một phương thức lưu trữ cho các data object trong PTOps. Nó cho phép người dùng xuất, lưu trữ, truyền tải, và nhập object vào/ra khỏi các bản cài đặt PTOps. Các hàm xuất và nhập được thực hiện từ UI của PTOps.

- **Tiêu đề**: Định Dạng Portable Data của PTOps
- **ID**: XYPDF
- **Phiên bản**: 1.1
- **Ngày**: 10 tháng 2, 2025
- **Tác giả**: Joseph Huckaby (PixlCore)

XYPDF là một file văn bản định dạng [JSON](https://en.wikipedia.org/wiki/JSON) với cấu trúc cụ thể. File có thể là văn bản thuần (với đuôi file `.json`), hoặc nén [Gzip](https://en.wikipedia.org/wiki/Gzip) (với đuôi file `.json.gz`). JSON có thể được nén gọn hoặc in đẹp (pretty-printed).

## Giao Diện Người Dùng

PTOps cho phép người dùng "xuất" các object thuộc nhiều loại khác nhau trong UI. Khi điều này xảy ra, cấu trúc dữ liệu đã chọn được serialize và đặt vào một wrapper XYPDF, làm cho nó có thể mang đi và tái sử dụng. File sau đó được tải xuống máy cục bộ của người dùng. File tương tự có thể được "nhập" lại vào PTOps qua tải file lên, hoặc thay thế object hiện có có cùng ID, hoặc tạo object mới khi cần.

## Định Dạng

Các thuộc tính JSON cấp cao nhất trong file XYPDF được định nghĩa như sau:

| Tên Thuộc Tính | Kiểu | Mô Tả |
|---------------|------|-------------|
| `type` | String | Định danh định dạng file, nên đặt là `xypdf`. |
| `version` | String | Phiên bản định dạng file, nên đặt là `1.0` |
| `xyops` | String | Phiên bản PTOps tối thiểu được hỗ trợ theo định dạng semver, ví dụ `1.0.0`. Thêm vào từ XYPDF v1.1. |
| `description` | String | Mô tả tuỳ chọn dễ đọc về file, sẽ là `PTOps Portable Data` nếu có mặt. |
| `items` | Array | Một mảng sub-object định nghĩa từng item trong file. Xem bên dưới để biết thêm. |

Mỗi item trong mảng `items` sẽ là một object với các thuộc tính sau:

| Tên Thuộc Tính | Kiểu | Mô Tả |
|---------------|------|-------------|
| `type` | String | Định danh loại dữ liệu, ví dụ `plugin`. Xem danh sách đầy đủ bên dưới. |
| `data` | Object | Nội dung thực tế của object (định dạng thay đổi -- xem bên dưới). |

## Các Loại Object

Các loại object sau có thể được xuất từ PTOps và bao gồm trong file XYPDF:

| Cấu Trúc Dữ Liệu | Type ID | Ghi Chú |
|----------------|---------|-------|
| [Alert](data.md#alert) | `alert` | - |
| [APIKey](data.md#apikey) | `api_key` | - |
| [Bucket](data.md#bucket) | `bucket` | Chỉ bao gồm metadata bucket, không bao gồm file hoặc dữ liệu thực tế. |
| [Category](data.md#category) | `category` | - |
| [Channel](data.md#channel) | `channel` | - |
| [Event](data.md#event) | `event` | Workflow thuộc nhóm này, vì chúng chỉ là event với thêm thuộc tính. |
| [Group](data.md#group) | `group` | - |
| [Monitor](data.md#monitor) | `monitor` | - |
| [Plugin](data.md#plugin) | `plugin` | - |
| [Role](data.md#role) | `role` | - |
| [Tag](data.md#tag) | `tag` | - |
| [WebHook](data.md#webhook) | `web_hook` | - |

## Ví Dụ

Đây là một file XYPDF ví dụ chứa một item, ở dạng văn bản thuần in đẹp:

```json
{
	"type": "xypdf",
	"version": "1.0",
	"xyops": "1.0.0",
	"description": "PTOps Portable Data",
	"items": [
		{
			"type": "web_hook",
			"data": {
				"id": "wmb6q7bh3hy",
				"title": "Discord",
				"enabled": true,
				"url": "https://discord.com/api/webhooks/123456789/abcdefghi",
				"method": "POST",
				"headers": [
					{
						"name": "Content-Type",
						"value": "application/json"
					},
					{
						"name": "User-Agent",
						"value": "PTOps/WebHook"
					}
				],
				"body": "{\n\t\"text\": \"{{text}}\",\n\t\"content\": \"{{text}}\",\n\t\"message\": \"{{text}}\"\n}",
				"timeout": 30,
				"retries": 0,
				"follow": false,
				"ssl_cert_bypass": false,
				"max_per_day": 0,
				"notes": "Posts to company Discord #general channel.",
				"icon": "chat-processing-outline",
				"username": "admin",
				"modified": 1761764935,
				"created": 1761764525,
				"revision": 3
			}
		}
	]
}
```

Khi xuất workflow, file XYPDF có thể chứa nhiều item, cho các Event và/hoặc Plugin phụ thuộc.

## Bảo Mật

Nhập file XYPDF được tải xuống từ nguồn không đáng tin cậy có thể rất nguy hiểm, vì chúng có thể chứa mã độc. Để phòng chống điều này, PTOps sẽ không xử lý bất kỳ file XYPDF tải lên nào mà không nhắc người dùng trước bằng một hộp thoại popup, và hiển thị **toàn bộ** nội dung file, đã in đẹp. Người dùng được hướng dẫn kiểm tra file trước khi xác nhận nhập.

Ngoài ra, nếu bất kỳ object nào trong file XYPDF được nhập sẽ **thay thế dữ liệu hiện có**, người dùng được cảnh báo và phải xác nhận hành động này.

## Tham Khảo

- [JSON](https://en.wikipedia.org/wiki/JSON)
- [Gzip](https://en.wikipedia.org/wiki/Gzip)
