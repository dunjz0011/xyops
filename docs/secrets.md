# Secrets

## Tổng Quan

Secret là các "vault" (kho) được mã hoá cho cấu hình nhạy cảm như API key, auth token, password, và các thông tin xác thực tương tự. Mỗi secret chứa một hoặc nhiều biến có tên (cặp key/value). PTOps lưu trữ dữ liệu biến được mã hoá lúc nghỉ (at rest) và chỉ giải mã trong bộ nhớ khi cần lúc runtime.

Secret có thể được cấp (gán) cho event, category, plugin, và web hook:

- Job được khởi chạy bởi event hoặc plugin nhận biến secret dưới dạng biến môi trường.
- Web hook có thể truy cập biến secret qua template expansion bằng `{{ secrets.VAR_NAME }}`.

Trang này giải thích cách secret được mô hình hoá, cách quyền truy cập được cấp, cách chúng được truyền tải lúc runtime, và cách truy cập được audit.

## Mô Hình Dữ Liệu

- Đối tượng Secret: Xem schema đầy đủ trong [Secret](data.md#secret).
- Payload đã mã hoá: Giá trị của biến nằm trong một record được mã hoá riêng biệt với metadata. UI và các API liệt kê chỉ trả về metadata; dữ liệu biến không bao giờ được lộ ra trừ khi được admin giải mã một cách rõ ràng.
- Metadata dạng plaintext: Các trường sau được lưu dưới dạng plaintext để hiển thị và định tuyến:
  - `id`, `title`, `enabled`, `icon`, `notes`
  - `names` (chỉ danh sách tên biến, không phải giá trị)
  - danh sách gán: `events`, `categories`, `plugins`, `web_hooks`

Giá trị secret luôn là string (vì chúng được truyền tải qua biến môi trường). Nếu bạn cần lưu dữ liệu binary, hãy [Base64-encode](https://en.wikipedia.org/wiki/Base64) trước.

## Mã Hoá

PTOps sử dụng mã hoá xác thực (authenticated encryption) để bảo vệ giá trị secret lúc nghỉ:

- Thuật toán: **AES-256-GCM** cho tính bảo mật và tính toàn vẹn.
	- AES-256-GCM là một thuật toán mã hoá đối xứng có độ an toàn cao, kết hợp Advanced Encryption Standard (AES) với key 256-bit và Galois/Counter Mode (GCM) để cung cấp cả tính bảo mật dữ liệu và xác thực.
- Dẫn xuất key: scrypt với `N=16384, r=8, p=1` và một salt ngẫu nhiên 16-byte cho mỗi record.
- Nonce/IV: IV ngẫu nhiên 12-byte cho mỗi record.
- AAD: ID của secret được ràng buộc như Additional Authenticated Data để tránh việc đổi lẫn giữa các record.
- Lưu trữ: Blob đã mã hoá bao gồm `alg`, `salt`, `iv`, `tag`, và `ct`.

Encryption key được dẫn xuất từ [config.secret_key](config.md#secret_key). Giữ giá trị này mạnh và bí mật trong production. Xem [Secret Key Rotation](hosting.md#secret-key-rotation) để biết hướng dẫn xoay secret key.

## Gán Quyền Truy Cập

Secret kiểm soát nơi chúng có thể được sử dụng bằng cách gán resource. Khi bất kỳ cái nào trong số này đang active, PTOps tự động giải mã và tiêm biến.

- `events`: Cấp cho các event được chọn; job của chúng nhận được các biến.
- `categories`: Cấp cho tất cả event trong các category được chọn.
- `plugins`: Cấp cho các plugin được chọn khi chúng chạy job, action hoặc trigger.
- `web_hooks`: Cấp cho các web hook được chọn; hook sử dụng template expansion thay cho biến môi trường.

### Thứ tự ưu tiên khi hợp nhất

Nếu nhiều secret được gán định nghĩa cùng một tên biến, giá trị cuối cùng được job sử dụng được xác định theo thứ tự hợp nhất:

1. Event
2. Sub-event của workflow (nếu áp dụng và khác)
3. Category
4. Plugin (hợp nhất cuối cùng, nên plugin thắng khi có xung đột)

Web hook không có việc hợp nhất; các biến của mỗi secret được tham chiếu sẽ được mở rộng độc lập trong template.

Khi một job là một phần của workflow, secret được gán cho cả sub-event và event workflow cha có thể áp dụng. Hệ thống tiêm secret của sub-event trước, sau đó secret của event cha, trước các lớp category và plugin.

## Truyền Tải Lúc Runtime

- Job: Biến secret được tiêm vào environment của process job dưới dạng cặp `NAME=value` ngay trước khi khởi chạy. Biến tuân theo quy tắc đặt tên POSIX (chữ, số và gạch dưới; nên bắt đầu bằng chữ hoặc gạch dưới).
- Web hook: Secret có sẵn cho hệ thống templating qua `{{ secrets.VAR_NAME }}` trong template URL, header, và body của hook.
- Vòng đời giải mã: Dữ liệu đã mã hoá vẫn ở trạng thái nghỉ cho đến chính xác thời điểm nó cần. PTOps giải mã vào bộ nhớ, sử dụng giá trị, và không bao giờ lưu lại dưới dạng plaintext.

## Audit Và Ghi Log

PTOps ghi lại cả việc sử dụng thường xuyên và truy cập do người dùng khởi xướng đối với secret.

**Sử dụng thường xuyên lúc runtime**: Được ghi "âm thầm" vào file `Secret.log` riêng mỗi khi một job, plugin hoặc web hook sử dụng secret. Entry bao gồm: timestamp epoch, ngày/giờ đã định dạng, hostname server, PID, mô tả bằng văn bản (ví dụ "Using secret ..."), toàn bộ metadata JSON của secret (không có giá trị), và loại truy cập (event, category, plugin, hoặc web hook). Ví dụ:

```
[1763675628.397][2025-11-20 13:53:48][joemax.lan][62614][Secret][debug][1][Using secret zmeejkeb8nu (Dev Database) for events: emeekm2ablu][{"secret":{"id":"zmeejkeb8nu","title":"Dev Database","enabled":true,"icon":"","notes":"This secret provides access to the dev database.","names":["DB_HOST","DB_PASS","DB_USER"],"events":["emeekm2ablu"],"categories":[],"plugins":[],"username":"admin","modified":1757204132,"created":1755365953,"revision":8,"web_hooks":["example_hook"]},"type":"events","id":"emeekm2ablu"}]
```

**Giải mã bởi Administrator**: Khi một admin giải mã một secret qua UI hoặc API, việc truy cập được ghi "rõ ràng" vào Activity Log và gắn tag với username. Các hoạt động tạo, cập nhật, và xoá cũng được ghi log. Ví dụ về việc truy cập:

```json
{
	"action": "secret_access",
	"username": "admin",
	"description": "Dev Database",
	"epoch": 1763675687,
	"id": "ami7yyuct2y",
	"useragent": "Safari 26.1.0 / macOS",
	"ip": "127.0.0.1",
	"ips": [
		"127.0.0.1"
	],
	"headers": {
		"host": "local.xyops.io:5523",
		/* Bỏ qua các HTTP header dài dòng để ngắn gọn */
	},
	"secret": {
		"id": "zmeejkeb8nu",
		"title": "Dev Database",
		/* Xem cấu trúc dữ liệu Secret để biết thêm */
	},
	"keywords": [
		"zmeejkeb8nu",
		"admin",
		"127.0.0.1"
	]
}
```

Để biết chi tiết API và định dạng response, xem [Secrets API](api.md#secrets).

## Sử Dụng Secret Trên UI

Trang admin Secrets yêu cầu privilege administrator.

- **Tạo**: Định nghĩa tiêu đề, icon/notes tuỳ chọn, gán cho event/category/plugin/web hook, và thêm biến. Giá trị được mã hoá khi lưu; chỉ `names` được lưu dưới dạng plaintext.
- **Sửa metadata và gán**: Bạn có thể cập nhật title, icon, notes, và danh sách gán mà không cần chạm vào dữ liệu đã mã hoá.
- **Xem hoặc sửa giá trị**: Giá trị không được load theo mặc định. Nhấn để xem/giải mã yêu cầu role admin và kích hoạt một xác nhận cùng một hoạt động được ghi log. Lưu sẽ cập nhật và mã hoá lại payload mới.
- **Bật/tắt**: Chuyển đổi khả năng sử dụng mà không xoá dữ liệu bên dưới.
- **Xoá**: Xoá vĩnh viễn cả metadata và payload đã mã hoá; hành động được ghi log.

## Thực Hành Tốt Nhất Và Giới Hạn

- Giữ title/notes không nhạy cảm: Không bao gồm giá trị secret hoặc gợi ý trong `title`, `notes` hoặc tên key (chúng được lưu dưới dạng plaintext).
- Đặt tên: Sử dụng tên rõ ràng, chữ hoa với gạch dưới, ví dụ `DB_HOST`, `API_TOKEN`. Tránh trùng lặp giữa các secret được gán.
- Dữ liệu binary: Base64-encode payload binary trước khi lưu. Nhớ rằng Base64 làm tăng kích thước khoảng ~33%.
- Giới hạn kích thước environment: POSIX không định nghĩa một mức tối đa cố định cho mỗi biến; hệ thống áp đặt giới hạn tổng kích thước của argv+environment cho `execve()` (ví dụ: Linux thường ≥2 MB; macOS thường ~256 KB). Một biến duy nhất có thể tiến gần đến giới hạn đó, nhưng overhead và các biến khác làm giảm khoảng dư. Nguyên tắc chung là giữ mỗi giá trị dưới vài kilobyte. Với dữ liệu lớn hơn, ưu tiên dùng file hoặc [Buckets](buckets.md) và truyền tham chiếu thay cho giá trị env lớn.
  - Mẹo: Trên một server đích, `getconf ARG_MAX` báo cáo giới hạn hệ thống cho argv+environment.
- Web hook: Ưu tiên đặt secret trong header hoặc body, không đặt trong URL. Tránh log lại các template đã mở rộng có thể lộ giá trị secret.
- Plugin/job: Đảm bảo script không echo biến môi trường ra log hoặc error output. Scrub hoặc redact khi cần.

## Link API

Để xem đầy đủ ví dụ request/response, xem tài liệu tham khảo API:

- [get_secrets](api.md#get_secrets)
- [get_secret](api.md#get_secret)
- [decrypt_secret](api.md#decrypt_secret)
- [create_secret](api.md#create_secret)
- [update_secret](api.md#update_secret)
- [delete_secret](api.md#delete_secret)
