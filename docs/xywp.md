# Wire Protocol của PTOps

## Tổng Quan

Tài liệu này mô tả **Wire Protocol của PTOps** (XYWP) v1.0, là phương thức chuẩn để giao tiếp giữa hai process có thể không biết gì về nhau. Các process có thể được viết bằng ngôn ngữ khác nhau, hoặc là file thực thi nhị phân. Wire protocol chỉ đơn giản định nghĩa một cách trao đổi dữ liệu có cấu trúc giữa chúng theo cách không phụ thuộc ngôn ngữ.

PTOps dùng wire protocol để giao tiếp với các Plugin của nó, có thể được viết bằng bất kỳ ngôn ngữ nào.

- **Tiêu đề**: Wire Protocol của PTOps
- **ID**: XYWP
- **Phiên bản**: 1.0
- **Ngày**: 16 tháng 11, 2025
- **Tác giả**: Joseph Huckaby (PixlCore)

XYWP sử dụng [JSON](https://en.wikipedia.org/wiki/JSON) qua các pipe [STDIO](https://en.wikipedia.org/wiki/Standard_streams) làm nền tảng giao tiếp. Cụ thể, [NDJSON](https://github.com/ndjson/ndjson-spec) được sử dụng, nghĩa là một message JSON đầy đủ được nén lại trên một dòng duy nhất. Bên gửi cần phân giới message JSON bằng một ký tự EOL duy nhất (ASCII 10), và bên nhận cần đọc theo dòng để phân giới message đến. XYWP xây dựng trên protocol nền này bằng cách thêm một vài thuộc tính quan trọng vào JSON cấp cao nhất, cho phép bên nhận biết thêm về message (xem bên dưới).

Trong hầu hết trường hợp, hai bên giao tiếp là PTOps / xySat, và một Plugin, được khởi tạo dưới dạng subprocess với pipe STDIO kết nối đến process cha. Nghĩa là, PTOps có thể gửi message JSON đã serialize trực tiếp vào luồng STDIN của process con, và tương tự process con có thể viết JSON đã serialize ra luồng STDOUT của nó, được bắt lại ở process cha.

Chỉ luồng STDIN và STDOUT được sử dụng. STDERR **không** phải là một phần của protocol, và thường được process cha bắt lại dưới dạng văn bản thô và hiển thị cho người dùng, trong trường hợp có lỗi.

## Các Thuộc Tính

Thuộc tính duy nhất luôn có mặt ở cấp cao nhất của mọi message XYWP là `xy`, cho biết phiên bản wire protocol, và luôn nên được đặt là `1`.

### Request

Khi PTOps gửi một "request" đến một Plugin, các thuộc tính sau sẽ được bao gồm ở cấp cao nhất của message JSON:

| Tên Thuộc Tính | Kiểu | Mô Tả |
|---------------|------|-------------|
| `xy` | Number | **(Bắt buộc)** Phiên bản Wire Protocol của PTOps, nên đặt là `1`. |
| `type` | String | Loại message được gửi, thay đổi tuỳ theo mục đích. |

### Response

Khi một Plugin gửi "response" trở lại PTOps, các thuộc tính sau sẽ được bao gồm ở cấp cao nhất của message JSON:

| Tên Thuộc Tính | Kiểu | Mô Tả |
|---------------|------|-------------|
| `xy` | Number | **(Bắt buộc)** Phiên bản Wire Protocol của PTOps, nên đặt là `1`. |
| `code` | Mixed | Nếu message là một response, thuộc tính `code` xác định thành công hoặc thất bại. Bất kỳ giá trị "falsey" nào như `0` hoặc `false` cho biết thành công. Bất kỳ giá trị "truthy" nào cho biết lỗi, và cũng cung cấp mã lỗi. |
| `description` | String | Trong trường hợp có lỗi, thuộc tính này nên chứa mô tả ngắn dễ đọc về lỗi. Tuỳ chọn đối với thành công. |

Khi một thuộc tính `code` có mặt trong message response, nó cho biết Plugin đã hoàn tất và sẽ exit. Nếu thuộc tính `code` **không** có mặt, nó cho biết Plugin vẫn đang chạy, và đang cung cấp một cập nhật trung gian.

## Ví Dụ

Đây là một request ví dụ để khởi chạy một job (Event Plugin):

```json
{
	"xy": 1, 
	"type": "event", 
	"id": "jmhzaot10tm",
	"event": "emi11ejdlde",
	"plugin": "pmi11dqsxcy",
	"server": "smf4j79snhe",
	"now": 1763256572.024,
	/* Xem cấu trúc dữ liệu Job để biết thêm */
}
```

Đây là một response ví dụ báo tiến độ (nghĩa là không có thuộc tính `code`):

```json
{ "xy": 1, "progress": 0.5 }
```

Đây là một response "cuối" ví dụ (có thuộc tính `code`) cho biết thành công, và Plugin sẽ exit ngay sau đó:

```json
{ "xy": 1, "code": 0 }
```

Đây là một response cuối ví dụ cho biết lỗi:

```json
{ "xy": 1, "code": 999, "description": "Failed to connect to database." }
```

## Passthrough

XYWP được thiết kế để hỗ trợ JSON "passthrough", nghĩa là nếu một process con phát ra JSON tới STDOUT mà **không** được nhận diện là message XYWP (không có thuộc tính `xy` ở cấp cao nhất hoặc nó không được đặt là `1`), message sẽ bị hoàn toàn bỏ qua, và "truyền qua" (passed through) như văn bản thuần.

Trong trường hợp Event Plugin của PTOps chạy job, JSON thông thường có thể được phát ra tới STDOUT và sẽ chủ yếu bị PTOps bỏ qua, và chỉ đơn giản được log lại như một phần của output job.

## Tham Khảo

- [JSON](https://en.wikipedia.org/wiki/JSON)
- [NDJSON](https://github.com/ndjson/ndjson-spec)
- [STDIO](https://en.wikipedia.org/wiki/Standard_streams)
- [Wire Protocol](https://en.wikipedia.org/wiki/Wire_protocol)
