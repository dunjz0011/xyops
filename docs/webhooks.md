# Web Hooks

## Tổng Quan

Web hook trong PTOps là các HTTP request gửi ra ngoài, được kích hoạt khi có hoạt động job và alert. Chúng tích hợp PTOps với các hệ thống bên ngoài như Slack, Discord, Pushover, hệ thống chat/incident, hoặc bất kỳ endpoint HTTP tuỳ chỉnh nào bạn kiểm soát.

- **Request tuỳ chỉnh hoàn toàn**: URL, method, header và body do người dùng định nghĩa và hỗ trợ templating (macro).
- **Kích hoạt theo action**: Job và alert kích hoạt hook dựa trên điều kiện (bắt đầu, kết quả, tag, suspend, limit, alert fired/cleared, v.v.).
- **Có thể quan sát**: Mỗi lần thực thi ghi lại thành công/thất bại, thời gian, request/response, và breakdown hiệu năng.

## Khi Nào Hook Kích Hoạt

Gắn một action "Web Hook" vào job (event/workflow) hoặc alert. Hook có thể kích hoạt khi:

- **Job bắt đầu**: `start` (trước khi launch từ xa).
- **Job hoàn thành**: `complete`, hoặc các kết quả cụ thể `success`, `error`, `warning`, `critical`, `abort`.
- **Tag của job**: `tag:TAGID` (khi hoàn thành và có tag đó).
- **Job bị suspend**: khi job bị suspend để chờ can thiệp của con người.
- **Limit tài nguyên của job**: khi vượt limit (memory tối đa / CPU tối đa / thời gian tối đa / output tối đa).
- **Alert**: `alert_new` khi alert được tạo, và `alert_cleared` khi alert được clear.

Lưu ý:

- Action được loại bỏ trùng lặp theo type + target (ví dụ cùng hook ID) trên các nguồn event/category/universal.
- Đối với job, action khi hoàn thành chỉ chạy nếu job không bị retry.

## Định Nghĩa Một Web Hook

Định nghĩa web hook có thể tái sử dụng và được action tham chiếu đến. Thuộc tính cốt lõi (xem schema đầy đủ tại [WebHook](docs/data.md#webhook)):

- `id`: ID alphanumeric duy nhất (tự sinh).
- `title`: Tiêu đề hiển thị.
- `enabled`: Bật/tắt mà không cần xoá.
- `icon`: ID [Material Design Icons](https://pictogrammers.com/library/mdi/) tuỳ chọn để hiển thị.
- `url`: Endpoint đầy đủ `http://` hoặc `https://`. Hỗ trợ templating; placeholder được URL-encode tự động.
- `method`: HTTP verb (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`).
- `headers`: Mảng `{ name, value }`. Value hỗ trợ templating.
- `body`: Body request tuỳ chọn dạng string. Hỗ trợ templating. Được gửi cho các method khác GET/HEAD khi không rỗng.
- `timeout`: Số giây chờ byte đầu tiên và socket idle (TTFB + idle).
- `retries`: Số lần tự động retry khi lỗi transport.
- `follow`: Tự động theo redirect (có giới hạn số lần nội bộ; tắt khi false).
- `ssl_cert_bypass`: Nếu true, tắt xác thực TLS (`rejectUnauthorized: false`).
- `max_per_day`: Giới hạn số lần thực thi mỗi ngày để chống flood (0 = không giới hạn).
- `notes`: Ghi chú tự do.

Tạo, cập nhật, liệt kê, xoá và test đều có sẵn qua UI và [Web Hooks API](docs/api.md#web-hooks).

## Templating Cho Request

`url`, `headers[].value`, và `body` của web hook hỗ trợ templating dùng biểu thức `{{ ... }}` được đánh giá theo [PTOps Expression Format](xyexp.md) với quyền truy cập context job/alert hiện tại. Ví dụ:

```
POST https://hooks.example.com/ingest/{{event.id}}?server={{nice_hostname}}
Authorization: Bearer {{ secrets.API_TOKEN }}
Content-Type: application/json

{
  "message": "{{text}}",
  "job": { "id": {{job.id}}, "event": "{{event.title}}", "code": {{job.code}} },
  "server": "{{nice_server}}",
  "links": {{ stringify(links) }}
}
```

Hành vi chính:

- Placeholder trong URL được URL-encode tự động.
- Secret có sẵn dưới dạng `{{ secrets.VAR_NAME }}` khi secret đã được gán cho hook (xem "Secrets" bên dưới).
- Các hàm hỗ trợ gồm `float()`, `integer()`, `bytes()`, `number()`, `pct()`, `encode()`, `stringify()`, `count()`, `min()`, `max()`, `round()`, `ceil()`, `floor()`, `clamp()`. Xem [PTOps Expression Format](xyexp.md) để có danh sách đầy đủ.
- Để dùng một parameter của job, bao gồm giá trị user field từ event, dùng `{{ job.params.PARAM_NAME }}`.
- Để dùng một parameter khởi chạy workflow từ job con trong workflow, dùng `{{ job.workflow.params.PARAM_NAME }}`.
- Để dùng output data từ một job, dùng `{{ job.data.PROP_NAME }}`.
- Context job: [JobHookData](data.md#jobhookdata) bao gồm `text`, `event`, `job`, `server`, `display` (tổng hợp CPU/mem), `links`, v.v.
- Context alert: [AlertHookData](data.md#alerthookdata) bao gồm `text`, `def`, `alert`, `server`, `links`, và các thông tin tiện lợi khác.

Gợi ý: Nên dùng JSON cho body khi có thể; với API dạng form-encoded, set `Content-Type: application/x-www-form-urlencoded` và soạn body tương ứng.

### Parameter Của Job và Workflow

Khi web hook kích hoạt cho một job, macro của nó được đánh giá theo [JobHookData](data.md#jobhookdata). Toàn bộ object job có sẵn dưới dạng `job`, nên parameter của event và user field có thể đọc từ `job.params`.

Ví dụ, nếu event của bạn có user field tên `TARGET` và `REGION`, bạn có thể dùng chúng trong URL, header, body của hook, hoặc trường "Custom Text" của action:

```
{{ job.params.TARGET }}
{{ job.params.REGION }}
```

Một body JSON có thể trông như thế này:

```json
{
	"message": "User selected {{ job.params.TARGET }}",
	"target": "{{ job.params.TARGET }}",
	"region": "{{ job.params.REGION }}",
	"job_id": "{{ job.id }}"
}
```

Đối với job chạy trong workflow, có hai scope parameter khác nhau:

- `job.params`: Parameter của job hoặc event node hiện tại.
- `job.workflow.params`: Parameter được cung cấp khi khởi chạy workflow ngoài.

Ví dụ, nếu form khởi chạy workflow có field `TARGET`, và event con cũng có field `TARGET` riêng, bạn có thể truy cập riêng biệt:

```
Current job target: {{ job.params.TARGET }}
Workflow target: {{ job.workflow.params.TARGET }}
```

Điều này khác với biến môi trường của shell plugin, nơi parameter của workflow được hiển thị với tiền tố `workflow_` như `${workflow_TARGET}`. Trong template web hook, dùng object path thay thế: `{{ job.workflow.params.TARGET }}`.

## Secrets

Web hook có thể dùng secret được mã hoá thông qua templating:

- Cú pháp: `{{ secrets.VAR_NAME }}` ở bất kỳ đâu trong `url`, `headers`, hoặc `body`.
- Gán quyền: Quản trị viên phải cấp secret cho hook trong trình chỉnh sửa secret. Nếu chưa gán, `secrets.*` sẽ trả về rỗng.
- Bảo mật: Tránh đặt secret trong URL (chúng có thể lưu lại trong log ở đích và PTOps ghi lại request đã soạn). Nên dùng header hoặc body.

Xem [Secrets](secrets.md) để biết mô hình, cách gán quyền và audit.

## Template Text Mặc Định

Khi một hook được action sử dụng, PTOps tự sinh giá trị `{{text}}` phù hợp với context từ các template có thể cấu hình ([hook_text_templates](config.md#hook_text_templates)). Bạn có thể thêm text riêng vào trường "Custom Text" của action.

Các template mặc định bao gồm:

```json
{
  "job_start": "Job started on {{nice_server}}: {{event.title}}: {{links.job_details}}",
  "job_success": "Job completed successfully on {{nice_server}}: {{event.title}}: {{links.job_details}}",
  "job_error": "Job failed on {{nice_server}}: {{event.title}}: Error ({{job.code}}): {{job.description}}: {{links.job_details}}",
  "job_progress": "Job is in progress on {{nice_server}} ({{event.title}}): {{links.job_details}}",
  "job_suspended": "Job is suspended and requires human intervention: {{event.title}}: {{links.job_details}}&resume=1",
  "job_limited": "{{action.msg}}: {{links.job_details}}",
  "alert_new": "Alert: {{nice_server}}: {{def.title}}: {{alert.message}}: {{links.alert_url}}",
  "alert_cleared": "Alert Cleared: {{nice_server}}: {{def.title}}"
}
```

Các template này cung cấp khả năng tương thích rộng với các dịch vụ phổ biến (Slack dùng `text`; Discord map sang `content`; Pushover dùng `message`). Bạn cũng có thể map `content`/`message` trong body về cùng giá trị với `text` nếu cần.

## Thực Thi và Khả Năng Quan Sát

Mỗi lần thực thi web hook ghi lại chẩn đoán chi tiết và hiển thị trong UI (Activity của job hoặc log action của alert):

- **Trạng thái**: Thành công với dòng trạng thái HTTP hoặc mã lỗi.
- **Thời gian**: Tổng thời gian và breakdown hiệu năng theo các giai đoạn network (dns, connect, send, wait, receive, compress, decompress).
- **Request**: Method cuối cùng, URL (đã mở rộng template và URL-encode), header, và body.
- **Response**: Header và body thô trả về từ endpoint.

Các chi tiết này cũng được trả về bởi API test để kiểm tra ad-hoc.

## Gợi Ý và Ví Dụ

Các mẫu này minh hoạ các tích hợp phổ biến. Thay ID và secret bằng của riêng bạn.

### Slack Incoming Webhook

- Tạo một Slack Incoming Webhook URL.
- Cấu hình hook:
  - method: `POST`
  - url: `https://hooks.slack.com/services/XXX/YYY/ZZZ`
  - headers: `Content-Type: application/json`
  - body:

```json
{
  "text": "{{text}}"
}
```

Nếu bạn dùng Bot Token + chat.postMessage mới hơn của Slack, set `Authorization: Bearer {{ secrets.SLACK_TOKEN }}` và thêm `channel` vào body.

### Discord Webhook

- Cấu hình hook:
  - method: `POST`
  - url: `https://discord.com/api/webhooks/ID/TOKEN`
  - headers: `Content-Type: application/json`
  - body:

```json
{
  "content": "{{text}}"
}
```

### Pushover

- Tạo một ứng dụng Pushover và lấy `PUSHOVER_API_KEY` và `PUSHOVER_APP_KEY`.
- Dùng hàm macro `encode` để URI-encode các giá trị cho x-www-form-urlencoded.
- Cấu hình hook:
  - method: `POST`
  - url: `https://api.pushover.net/1/messages.json`
  - headers: `Content-Type: application/x-www-form-urlencoded`
  - body:

```
token={{ encode(secrets.PUSHOVER_APP_KEY) }}&user={{ encode(secrets.PUSHOVER_API_KEY) }}&message={{ encode(text) }}
```

### ntfy.sh

- Chọn một tên topic riêng tư. Trên `ntfy.sh`, tên topic là công khai và tên dễ đoán có thể bị người khác phát hiện.
- Tuỳ chọn nhưng nên làm với topic được bảo vệ: tạo access token và lưu làm secret như `NTFY_TOKEN`.
- Cấu hình hook:
  - method: `POST`
  - url: `https://ntfy.sh/YOUR_TOPIC`
  - headers: 
  	- `Content-Type: text/plain; charset=utf-8`, 
	- `Title: PTOps: {{event.title}}`,
	- `Priority: high`, 
	- `Tags: warning`, 
	- `Authorization: Bearer {{ secrets.NTFY_TOKEN }}`
  - body:

```
{{text}}
```

Nếu topic của bạn cho phép ghi ẩn danh, bỏ header `Authorization`. Với ntfy tự host, thay `https://ntfy.sh` bằng URL server của bạn.

### API Bearer Chung

- Cấu hình hook:
  - method: `POST`
  - url: `https://api.example.com/v1/event`
  - headers: `Authorization: Bearer {{ secrets.API_TOKEN }}`, `Content-Type: application/json`
  - body:

```json
{
  "source": "xyops",
  "summary": "{{text}}",
  "job": { "id": "{{job.id}}", "event": "{{event.title}}", "code": "{{job.code}}" },
  "server": "{{nice_server}}"
}
```

## Xử Lý Sự Cố

- Hook không kích hoạt: Xác nhận điều kiện action khớp và hook đang bật. Với job, đảm bảo lần chạy không bị retry; action khi hoàn thành bỏ qua các lần retry.
- Giới hạn hàng ngày: Nếu `max_per_day` được set và đã đạt, PTOps bỏ qua thực thi và ghi lại một lỗi (hiển thị trên trang chi tiết job).
- Lỗi templating: Biểu thức `{{ ... }}` không hợp lệ trong body bị từ chối khi lưu/cập nhật. Với URL/header/body, dùng chức năng Test để kiểm tra kết quả mở rộng.
- Vấn đề TLS: Với endpoint dev dùng chứng chỉ tự ký, bật "SSL Cert Bypass". Nên dùng chứng chỉ hợp lệ ở production.
- Secret không mở rộng: Đảm bảo secret đã gán cho hook và tên biến khớp. Tránh dùng secret trong URL khi có thể.

## Tham Chiếu API

Quản lý bằng code và test trực tiếp:

- [get_web_hooks](api.md#get_web_hooks) -- liệt kê hook
- [get_web_hook](api.md#get_web_hook) -- lấy một hook
- [create_web_hook](api.md#create_web_hook) -- tạo hook
- [update_web_hook](api.md#update_web_hook) -- cập nhật, shallow merge
- [delete_web_hook](api.md#delete_web_hook) -- xoá hook
- [test_web_hook](api.md#test_web_hook) -- test trực tiếp, trả về báo cáo markdown

Xem [Web Hook APIs](api.md#web-hooks) để có ví dụ request/response đầy đủ.

## Xem Thêm

- [Actions](actions.md)
- [WebHook Object](data.md#webhook)
- [Web Hook API](api.md#web-hooks)
- [Secrets](secrets.md)
- [hook_text_templates](config.md#hook_text_templates)
