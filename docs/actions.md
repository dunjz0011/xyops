# Actions

## Overview

Action trong PTOps xử lý phản ứng với kết quả job và thay đổi trạng thái alert. Bạn gắn action vào event (job) và alert để khi các điều kiện cụ thể xảy ra, PTOps thực thi một hoặc nhiều action song song. Các action thường gặp bao gồm gửi email, kích hoạt web hook, chạy job, tạo ticket, chụp snapshot, và nhiều hơn nữa.

Tài liệu này giải thích action hoạt động thế nào, các condition mà chúng hỗ trợ, và chi tiết từng loại action kèm tham số và ví dụ.

## Key Points

- Action là các object định nghĩa nhỏ với ba trường cốt lõi: `enabled`, `condition`, và `type`. Các trường bổ sung tuỳ theo loại.
- Job action nằm trong event và có thể kích hoạt khi job bắt đầu hoặc hoàn thành với một kết quả cụ thể. Một số loại action chỉ dùng cho job. Category và universal default có thể bổ sung action.
- Alert action nằm trong định nghĩa alert và kích hoạt khi alert được tạo (fired) và/hoặc clear. Group và universal default có thể bổ sung action.
- Action thực thi song song và được loại bỏ trùng lặp (dedupe) theo type + target (ví dụ: cùng người nhận email, cùng web hook ID). Kết quả được ghi vào activity log kèm chi tiết khi có.

Ví dụ action tối giản (định dạng JSON):

```json
{
    "enabled": true,
    "condition": "error",
    "type": "email",
    "email": "admin@example.com"
}
```

## Nơi Action Được Định Nghĩa

- **Trình chỉnh sửa Event**: Thêm job action để chạy khi job bắt đầu hoặc theo kết quả hoàn thành.
- **Trình dựng Workflow**: Gắn job action vào node workflow.
- **Alert Setup**: Thêm alert action để chạy khi alert fire và/hoặc clear.
- **Categories**: Category của event có thể đặt job action mặc định.
- **Groups**: Group của server có thể đặt alert action mặc định.
- **Universal**: Cấu hình server có thể thêm job action và alert action toàn hệ thống.

## Action Condition

Mỗi action có một `condition` chọn thời điểm nó chạy.

- **Job condition**:
  - `start`: Khi job bắt đầu chạy (trước khi khởi chạy trên remote).
  - `complete`: Khi job hoàn thành, bất kể kết quả.
  - `success`: Khi job hoàn thành thành công (nghĩa là `code` bằng `0` hoặc `false`).
  - `error`: Khi job hoàn thành với bất kỳ lỗi nào (nghĩa là `code` khác 0/false).
  - `user`: Khi job hoàn thành với mã lỗi tuỳ chỉnh (nghĩa là không phải `warning`, `critical` hay `abort`).
  - `warning`: Khi job hoàn thành với `code` là `"warning"`.
  - `critical`: Khi job hoàn thành với `code` là `"critical"`.
  - `abort`: Khi job bị hủy (do người dùng hoặc điều kiện lỗi).
  - `tag:TAGID`: Khi job hoàn thành, chỉ nếu tag đó có mặt trên job.
- **Workflow condition**:
  - `continue`: Condition đặc biệt kích hoạt từ một [Controller](workflows.md#controller-nodes) trong workflow, sau khi tất cả job được kết nối đã hoàn thành.
- **Alert condition**:
  - `alert_new`: Khi alert fire trên một server.
  - `alert_cleared`: Khi alert đang active được clear.

Ghi chú:

- Job completion action chỉ chạy nếu job không bị retry. Điều này bao gồm cả tag condition.
- Job start action chạy trước khi khởi chạy trên remote; một start action có thể suspend hoặc abort job trước khi nó chạy.

## Action Chạy Như Thế Nào

- **Thực thi**: Tất cả action khớp với một trigger nhất định chạy song song.
- **Loại bỏ trùng lặp**: Action được dedupe theo tổ hợp type và target (ví dụ: người nhận email, web hook ID, event ID, channel ID, plugin ID, bucket ID). Điều này ngăn gửi trùng lặp khi nhiều nguồn cùng đóng góp một action giống nhau.
- **Ghi nhận**: Với job, hoạt động action và chi tiết xuất hiện trong Activity log và metadata của job. Với alert, bản ghi invocation lưu kết quả và chi tiết của action.

## Tính Tương Thích

Một số loại action chỉ dùng cho job và không thể dùng với alert:

- Chỉ dùng cho job: Store Bucket (`store`), Fetch Bucket (`fetch`), Disable Event (`disable`), Delete Event (`delete`), Suspend Job (`suspend`).
- Tất cả loại khác có thể dùng cho cả job và alert.

## Action Object

Tất cả object [Action](data.md#action) bao gồm các thuộc tính chung sau:

| Thuộc Tính | Kiểu | Mô Tả |
|---------|------|-------------|
| `enabled` | Boolean | Bật (`true`) hoặc tắt (`false`) action. |
| `condition` | String | Khi nào action chạy. Xem Action Condition. |
| `type` | String | Action nào sẽ thực thi. Xem Action Types bên dưới. |

Các thuộc tính bổ sung tuỳ theo loại action.

## Action Types

### Email

Gửi thông báo email đến một hoặc nhiều user và/hoặc địa chỉ email tường minh. Với job, message bao gồm context (link, đoạn log, hiệu năng, v.v.). Với alert, template bao gồm context của server và link.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `users` | Array(String) | Tuỳ chọn | Danh sách [User.username](data.md#user-username) để gửi email. |
| `email` | String | Tuỳ chọn | Một hoặc nhiều người nhận bổ sung, phân tách bằng dấu phẩy. |
| `body` | String | Tuỳ chọn | Tuỳ chọn tuỳ chỉnh chủ đề và nội dung email bằng Markdown (xem [Custom Email](#custom-email) bên dưới). |

Ví dụ (job error):

```json
{
    "enabled": true,
    "condition": "error",
    "type": "email",
    "users": ["oncall"],
    "email": "ops@example.com, dev@example.com"
}
```

Ví dụ (alert fired):

```json
{
    "enabled": true,
    "condition": "alert_new",
    "type": "email",
    "users": ["oncall", "sre"],
    "email": "noc@example.com"
}
```

#### Custom Email

Nếu thuộc tính `body` được cung cấp, nó được dùng thay cho template chuẩn khi soạn email. Đây nên là chuỗi văn bản nhiều dòng theo định dạng [GitHub-Flavored Markdown](https://github.github.com/gfm/). Bạn cũng có thể dùng [PTOps Expression Format](xyexp.md) để lấy giá trị từ object [JobHookData](data.md#jobhookdata).

Ngoài ra, các cặp key/value metadata đặc biệt có thể được chỉ định bằng [HTML Comments](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Comments) (bị trình phân giải markdown bỏ qua) cho những thứ như dòng chủ đề email. Cú pháp là: `<!-- KEY: VALUE -->`. Ví dụ sử dụng:

```
<!-- To: {{email_to}} -->
<!-- Subject: ✅ {{config.client.name}} Job Completed Successfully: {{event.title}} -->
<!-- Title: Job Successful -->
<!-- Button: View Details | {{links.job_details}} -->
```

Đây là danh sách các thuộc tính comment được hỗ trợ mà bạn có thể đưa vào:

| Comment Key | Mô Tả |
|-------------|-------------|
| `To` | Trở thành header "To" của email. Dùng `{{email_to}}` cho danh sách người nhận kết hợp từ action. |
| `From` | Trở thành header "From" của email. Mặc định là thuộc tính cấu hình toàn cục [email_from](config.md#email_from). |
| `Subject` | Trở thành header "Subject" của email. |
| `Title` | Hiển thị bằng chữ đậm lớn trong phần header HTML của email. Thường ngắn gọn hơn subject. |
| `Button` | Tuỳ chọn hiển thị một nút lớn trong header với label và link (phân tách bằng dấu pipe). |
| `Logo_URL` | Tuỳ chọn tuỳ chỉnh URL ảnh logo dùng trong header HTML của email. |
| `Version` | Tuỳ chọn tuỳ chỉnh văn bản version hiển thị ở footer HTML của email. |
| `Copyright` | Tuỳ chọn tuỳ chỉnh văn bản copyright hiển thị ở footer HTML của email. |

Đây là template đầy đủ dùng khi job hoàn thành thành công:

```
	<!-- To: {{email_to}} -->
	<!-- Subject: ✅ {{config.client.name}} Job Completed Successfully: {{event.title}} -->
	<!-- Title: Job Successful -->
	<!-- Button: View Details | {{links.job_details}} -->

	The following {{config.client.name}} job has completed successfully:

	- **Job ID:** `{{job.id}}`
	- **Event:** {{event.title}}
	- **Category:** {{category.title}}
	- **Plugin:** {{plugin.title}}
	- **Server:** {{nice_server}}
	- **PID:** {{job.pid}}
	- **Completed:** {{display.date_time}}
	- **Elapsed Time:** {{display.elapsed}}
	- **Performance Metrics:** `{{display.perf}}`
	- **Avg. Memory Usage:** {{display.mem}}
	- **Avg. CPU Usage:** {{display.cpu}}

	### Links:
	- [Job Details]({{links.job_details}})
	- [Download Log]({{links.job_log}}) ({{display.log_size}})

	### Job Files:
	{{links.job_files}}

	### Job Output:
	{{log_excerpt}}

	### Event Notes:
	{{job.notes}}
```

### Web Hook

Kích hoạt một web hook đã cấu hình. PTOps gửi một payload theo template với context phong phú (job hoặc alert), và bạn có thể thêm văn bản tuỳ chỉnh.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `web_hook` | String | Có | [WebHook.ID](data.md#webhook-id) của hook. |
| `text` | String | Tuỳ chọn | Văn bản bổ sung thêm vào nội dung message được tạo. |

Ví dụ (job critical):

```json
{
    "enabled": true,
    "condition": "critical",
    "type": "web_hook",
    "web_hook": "slack_ops",
    "text": "Paging on-call"
}
```

Ví dụ (alert cleared):

```json
{
    "enabled": true,
    "condition": "alert_cleared",
    "type": "web_hook",
    "web_hook": "slack_ops"
}
```

Xem [Web Hooks](webhooks.md) để biết thêm chi tiết về web hook.

### Run Event

Chạy một event khác như một action tiếp theo. Job mới kế thừa context, và với job action bạn có thể ghi đè tham số của event con.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `event_id` | String | Có | [Event.id](data.md#event-id) đích để chạy. |
| `params` | Object | Tuỳ chọn | Ghi đè tham số cho event được chạy. |
| `target_server` | Boolean | Tuỳ chọn | Với alert action, việc này sẽ ghi đè [Event.targets](data.md#event-targets) để nhắm vào server nơi alert kích hoạt. |
| `clear_alert` | Boolean | Tuỳ chọn | Với alert action, việc này sẽ clear alert khi job hoàn thành. Hữu ích cho signal alert (ví dụ: file đang chờ xử lý). |

Ví dụ (job warning):

```json
{
    "enabled": true,
    "condition": "warning",
    "type": "run_event",
    "event_id": "postprocess_assets",
    "params": { "optimize": true, "quality": 80 }
}
```

Ví dụ (alert fired):

```json
{
    "enabled": true,
    "condition": "alert_new",
    "type": "run_event",
    "event_id": "scale_out",
	"target_server": true,
	"clear_alert": false
}
```

Xem [Events](events.md) để biết thêm chi tiết về event.

### Channel

Thông báo đến một channel đã cấu hình. Channel có thể đóng gói user (email/notify), một web hook, và/hoặc một event để chạy. PTOps thực thi các action bên trong và tổng hợp kết quả của chúng.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `channel_id` | String | Có | [Channel.id](data.md@channel-id) channel thông báo. |

Ví dụ (job error):

```json
{
    "enabled": true,
    "condition": "error",
    "type": "channel",
    "channel_id": "ops_oncall"
}
```

Ví dụ (alert fired):

```json
{
    "enabled": true,
    "condition": "alert_new",
    "type": "channel",
    "channel_id": "noc_pager"
}
```

Xem [Channels](channels.md) để biết thêm chi tiết về channel.

### Snapshot

Chụp snapshot server. Với job, job phải nhắm vào một server cụ thể. Với alert, snapshot được chụp cho server của alert. Link đến snapshot được bao gồm trong kết quả.

Tham số: Không có

Ví dụ (job error):

```json
{
    "enabled": true,
    "condition": "error",
    "type": "snapshot"
}
```

Ví dụ (alert fired):

```json
{
    "enabled": true,
    "condition": "alert_new",
    "type": "snapshot"
}
```

Xem [Snapshots](snapshots.md) để biết thêm chi tiết về snapshot.

### Ticket

Tạo một ticket với nội dung được tự động sinh dựa trên context (job hoặc alert). Ticket được thêm vào hệ thống ticket của PTOps và liên kết lại với job hoặc alert.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `ticket_type` | String | Có | Xem [Ticket.type](data.md#ticket-type) (ví dụ: `issue`, `task`, v.v.). |
| `ticket_assignees` | Array(String) | Có | Danh sách [User.username](data.md#user-username) người được assign. |
| `ticket_tags` | Array(String) | Tuỳ chọn | Danh sách giá trị [Tag.id](data.md#tag-id). |
| `ticket_due` | String hoặc Number | Tuỳ chọn | Hạn chót cho ticket mới. Có thể là Unix epoch time tuyệt đối, hoặc một độ lệch ngày tương đối như `1 day`, `3 days`, hoặc `1d`. |

Ví dụ (job error):

```json
{
	"enabled": true,
	"condition": "error",
	"type": "ticket",
	"ticket_type": "issue",
	"ticket_assignees": ["oncall"],
	"ticket_tags": ["production", "sev2"],
	"ticket_due": "3 days"
}
```

Ví dụ (alert cleared):

```json
{
	"enabled": true,
	"condition": "alert_cleared",
	"type": "ticket",
	"ticket_type": "task",
	"ticket_assignees": ["sre"],
	"ticket_tags": ["cleanup"],
	"ticket_due": "1 day"
}
```

Xem [Tickets](tickets.md) để biết thêm chi tiết về ticket, bao gồm [New Ticket Template](tickets.md#new-ticket-template), có thể cung cấp giá trị mặc định `cc`, `notify`, và `due`.

### Plugin

Gọi một Action Plugin tuỳ chỉnh. PTOps thực thi command/script của plugin bạn với một payload JSON có cấu trúc qua STDIN và biến môi trường. Plugin có thể xuất JSON ra STDOUT cho kết quả phong phú.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `plugin_id` | String | Có | [Plugin.id](data.md#plugin-id) của một plugin với `type: "action"`. |
| `params` | Object | Tuỳ chọn | Giá trị tham số do plugin định nghĩa. |

Ví dụ (job success):

```json
{
    "enabled": true,
    "condition": "success",
    "type": "plugin",
    "plugin_id": "notify_grafana",
    "params": { "dashboard": "builds", "panel": "summary" }
}
```

Ví dụ (alert fired):

```json
{
    "enabled": true,
    "condition": "alert_new",
    "type": "plugin",
    "plugin_id": "custom_webhook",
    "params": { "route": "alerts", "priority": "high" }
}
```

Xem [Plugins](plugins.md) để biết thêm chi tiết về plugin.

### Suspend Job

Suspend job đang chạy cho đến khi user resume nó trên UI. Tuỳ chọn thông báo cho user và/hoặc kích hoạt web hook về việc suspend.

Với sub-job của workflow, một suspend kích hoạt tại thời điểm job hoàn thành có thể tuỳ chọn resume bằng cách nhảy đến một node Event hoặc Job được chọn trong workflow. Lựa chọn resume này chỉ hiện ra cho completion action, như `On Complete`, `On Success`, `On Any Error` và các condition kết thúc job khác. Nó không hiện ra cho suspend `On Start`. Xem [Custom Resume Flow](workflows.md#custom-resume-flow) để biết chi tiết.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `users` | Array(String) | Tuỳ chọn | Danh sách [User.username](data.md#user-username) để gửi email. |
| `email` | String | Tuỳ chọn | Một hoặc nhiều người nhận bổ sung, phân tách bằng dấu phẩy. |
| `web_hook` | String | Tuỳ chọn | [WebHook.id](data.md#webhook-id) để kích hoạt khi suspend. |
| `text` | String | Tuỳ chọn | Văn bản bổ sung thêm vào message web hook khi suspend. |

Ví dụ (job start):

```json
{
    "enabled": true,
    "condition": "start",
    "type": "suspend",
    "users": ["deployers"],
    "email": "ops@example.com",
    "web_hook": "slack_ops",
    "text": "Manual review required before proceeding."
}
```

### Disable Event

Tắt event hiện tại khi action chạy. Hữu ích sau các lỗi để ngăn các lần chạy theo schedule tiếp theo cho đến khi được bật lại thủ công.

Tham số: Không có

Ví dụ (job error):

```json
{
    "enabled": true,
    "condition": "error",
    "type": "disable"
}
```

### Delete Event

Xoá event hiện tại khi action chạy. Sử dụng cẩn thận; event bị xoá khỏi hệ thống. Action này được thiết kế cho các event một lần dùng (ephemeral) tự xoá sau khi chạy.

Tham số: Không có

Ví dụ (job critical):

```json
{
    "enabled": true,
    "condition": "critical",
    "type": "delete"
}
```

### Store Bucket

Lưu dữ liệu và/hoặc file của job vào storage bucket. Bạn có thể kiểm soát việc đồng bộ data, file, hoặc cả hai, và lọc file nào được bao gồm bằng glob pattern. Các limit của bucket (kích thước file tối đa, số file tối đa mỗi bucket) vẫn được áp dụng.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `bucket_id` | String | Có | [Bucket.id](data.md#bucket-id) đích. |
| `bucket_sync` | String | Có | Kiểm soát loại dữ liệu nào được lưu. Một trong `data`, `files`, `data_and_files`. |
| `bucket_glob` | String | Tuỳ chọn | Glob pattern để khớp các file nhất định của job và chỉ lưu những file đó (mặc định `*`). |

Ví dụ (job success):

```json
{
    "enabled": true,
    "condition": "success",
    "type": "store",
    "bucket_id": "bme4wi6pg35",
    "bucket_sync": "data_and_files",
    "bucket_glob": "*.json"
}
```

**Lưu ý:** Job phải xuất data và/hoặc file một cách tường minh trước khi action Store Bucket có thể thấy chúng. Xem [Output Data](plugins.md#output-data) và [Output Files](plugins.md#output-files) để biết chi tiết.

Xem [Buckets](buckets.md) để biết thêm chi tiết về storage bucket.

### Fetch Bucket

Lấy data và/hoặc file từ bucket và gắn chúng vào input context của job. File khớp với glob được thêm vào danh sách file input của job; data được shallow-merge vào data input của job.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `bucket_id` | String | Có | [Bucket.id](data.md#bucket-id) đích. |
| `bucket_sync` | String | Có | Kiểm soát loại dữ liệu nào được lấy. Một trong `data`, `files`, `data_and_files`. |
| `bucket_glob` | String | Tuỳ chọn | Glob pattern để khớp các file nhất định của job và chỉ lấy những file đó (mặc định `*`). |

Ví dụ (job start):

```json
{
    "enabled": true,
    "condition": "start",
    "type": "fetch",
    "bucket_id": "bme4wi6pg35",
    "bucket_sync": "files",
    "bucket_glob": "*.csv"
}
```

### Apply Tags

Áp dụng một tập tag tuỳ chỉnh vào job hoặc workflow.

Tham số:

| Tên | Kiểu | Bắt Buộc | Mô Tả |
|------|------|----------|-------------|
| `tags` | Array | Có | Danh sách [Tag.id](data.md#tag-id) để áp dụng. |

Ví dụ (job complete):

```json
{
    "enabled": true,
    "condition": "complete",
    "type": "tag",
    "tags": ["important"]
}
```

Lưu ý rằng tag được loại bỏ trùng lặp khi job hoàn thành.

## Ghi Chú và Gợi Ý

- Với job action, payload email/web hook bao gồm link job, đoạn log, chỉ số hiệu năng và mọi file đính kèm (nếu có).
- Với alert action, payload bao gồm chi tiết server dễ đọc, link đến server và alert, và message của alert.
- Job condition dựa trên tag được chỉ định là `tag:TAGID` và chỉ kích hoạt khi job hoàn thành.
- Bucket action tuân theo các limit đã cấu hình như kích thước file tối đa và số file tối đa mỗi bucket.

## Xem Thêm

- Cấu trúc dữ liệu [Action](data.md#action)
- [Alerts](alerts.md)
- [Webhooks](webhooks.md)
- [Channels](channels.md)
- [Buckets](buckets.md)
- [Tickets](tickets.md)
- [Plugins](plugins.md)
- [Events](events.md)
- [Workflows](workflows.md)
