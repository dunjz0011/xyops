# System Hooks

## Tổng Quan

System Hooks cho phép bạn chạy các action tuỳ chỉnh ở nền để phản hồi hoạt động toàn hệ thống trong PTOps. Hoạt động bao gồm transaction của người dùng (tạo/sửa/xoá object, truy cập secret), sự kiện hệ thống (server kết nối/mất kết nối, thay đổi conductor), và các thông báo chung (`notice`, `warning`, `error`, `critical`). Hook action có thể gọi web hook, chạy lệnh shell, gửi email, và/hoặc tạo ticket.

System Hooks được cấu hình trong `config.json` dưới object `hooks`. Hook action chạy song song và luôn chạy ở nền.

## Cấu Hình

Hook được cấu hình trong file `config.json` chính (xem `sample_conf/config.json`). Theo mặc định, không có hook nào được định nghĩa:

```json
"hooks": {}
```

Mỗi key dưới `hooks` là một activity type ID, và giá trị là một object mô tả một hoặc nhiều hook action sẽ chạy. Bạn có thể kết hợp nhiều action trong cùng một hook, và tất cả sẽ chạy.

Ví dụ cấu hình:

```json
"hooks": {
	"error": {
		"shell_exec": "/opt/system/bin/notify-error.sh"
	},
	"critical": {
		"shell_exec": "/opt/system/bin/notify-critical.sh",
		"email": "oncall-pager@mycompany.com",
		"ticket": {
			"type": "issue",
			"assignees": ["admin"]
		}
	},
	"secret_access": {
		"web_hook": "mkd0t84o7hwasu0g"
	}
}
```

## Activity Type ID

- Xem [Activity.action](data.md#activity-action) để biết danh sách toàn bộ activity type ID mà bạn có thể gắn system hook action toàn cục vào:
- Xem [Activity](data.md#activity) để biết chi tiết về định dạng payload activity và các thuộc tính chung.

## Điều Kiện Job và Alert

Tất cả job action cũng kích hoạt System Hooks, sử dụng tiền tố `job_` trên điều kiện action. Các ví dụ phổ biến bao gồm:

- `job_complete`: Bất kỳ job nào hoàn thành (thành công hoặc thất bại)
- `job_success`: Hoàn thành thành công
- `job_error`: Bất kỳ hoàn thành thất bại nào
- `job_warning`: Hoàn thành với mã warning
- `job_critical`: Hoàn thành với mã critical
- `job_abort`: Job bị huỷ bởi người dùng hoặc điều kiện thất bại

Job action dựa trên tag cũng phát ra hook sử dụng cùng tiền tố `job_` (ví dụ, `job_tag:deploy`). Xem phần "Action Conditions" trong [Actions](actions.md) để biết danh sách đầy đủ điều kiện action của job và alert.

Alert action cũng kích hoạt System Hooks:

- `alert_new`
- `alert_cleared`

## Hook Firehose

Bạn có thể cấu hình một hook bắt-tất-cả bằng key `*` (dấu hoa thị). Nó sẽ kích hoạt cho mọi activity type:

```json
"hooks": {
	"*": {
		"shell_exec": "/opt/system/bin/firehose.sh"
	}
}
```

## Các Loại Hook Action

System Hooks hỗ trợ các loại action sau. Bạn có thể dùng bất kỳ kết hợp nào trong một hook, và tất cả action sẽ chạy song song.

### Web Hook

Bạn có hai tuỳ chọn để gọi web hook:

1. **URL đơn giản**: Chỉ định URL trực tiếp trong `config.json`, và PTOps sẽ POST payload activity dạng JSON.
2. **Web hook đã cấu hình**: Tham chiếu một web hook ID được quản lý bên trong PTOps để có toàn quyền kiểm soát method, header, body và templating.

Ví dụ URL đơn giản:

```json
"hooks": {
	"alert_new": {
		"url": "http://alerts.mycompany.com/api/new-alert/v1"
	}
}
```

Ví dụ web hook đã cấu hình:

```json
"hooks": {
	"alert_new": {
		"web_hook": "wmkd2yx4yw4ihh7lu"
	},
	"job_error": {
		"web_hook": "wmkd312hugd31hqdh"
	}
}
```

Với web hook đã cấu hình, xem [Web Hooks](webhooks.md). Payload dựa trên định dạng [Activity](data.md#activity).

### Shell Exec

Action `shell_exec` khởi tạo một process và gửi payload activity vào STDIN của lệnh đó. Payload là JSON trên một dòng duy nhất (tức là [PTOps Wire Protocol](xywp.md)).

Ví dụ:

```json
"hooks": {
	"critical": {
		"shell_exec": "/path/to/script.sh"
	}
}
```

Lệnh luôn chạy trên server conductor chính, nên hãy sử dụng thật cẩn thận. Để debug, grep từ khoá `System Shell Hook` trong log `/opt/xyops/logs/Action.log`. Tăng [debug_level](config.md#debug_level) toàn cục lên `9` để log chi tiết hơn.

### Gửi Email

Action `email` gửi một email tóm tắt activity chung. Nó bao gồm tóm tắt activity, toàn bộ payload (JSON), và bất kỳ chi tiết nào nếu có (phổ biến với `notice`, `warning`, `error`, `critical`). Nhiều người nhận có thể được chỉ định dưới dạng danh sách phân tách bằng dấu phẩy.

Ví dụ:

```json
"hooks": {
	"critical": {
		"email": "oncall-pager@mycompany.com"
	}
}
```

Lưu ý rằng để gửi email cho alert server (một cấu hình rất phổ biến) thì tốt hơn **nhiều** khi dùng tính năng [alert_universal_actions](config.md#alert_universal_actions), tính năng này tạo ra một email tập trung vào alert đúng chuẩn (email tạo từ system hook chung hơn). Cấu hình khuyến nghị cho email alert toàn cục:

```json
"alert_universal_actions": [
	{
		"enabled": true,
		"hidden": true,
		"condition": "alert_new",
		"type": "snapshot"
	},
	{
		"enabled": true,
		"condition": "alert_new",
		"type": "email",
		"email": "oncall-pager@mycompany.com"
	}
]
```

Điều này cũng áp dụng cho job thất bại. Nếu bạn muốn gửi email cho tất cả job thất bại, dùng tính năng [job_universal_actions](config.md#job_universal_actions) thay thế, vì nó tạo ra email đúng chuẩn hơn cho job:

```json
"job_universal_actions": {
	"default": [
		{
			"enabled": true,
			"condition": "error",
			"type": "email",
			"email": "oncall-pager@mycompany.com"
		}
	]
}
```

### Tạo Ticket

Action `ticket` tạo một ticket cho activity. Bất kỳ trường ticket nào cũng có thể được bao gồm ở đây. Xem [Tickets](tickets.md) và định nghĩa [Ticket](data.md#ticket) để biết chi tiết trường.

Ví dụ:

```json
"hooks": {
	"critical": {
		"ticket": {
			"assignees": ["admin"],
			"type": "issue"
		}
	}
}
```

Lưu ý rằng ticket được gán tự động gửi email đến tất cả assignee (giả sử [tickets.email_enabled](config.md#tickets-email_enabled) được bật), vậy đây cũng là một cách khác để nhận email cho các báo cáo activity cụ thể.

Nếu bạn muốn tạo một ticket cực kỳ ồn ào và khó chịu, đặt thuộc tính `due` thành `today`, việc này sẽ bắt đầu gửi nhắc nhở quá hạn hàng ngày đến tất cả assignee:

```json
"hooks": {
	"critical": {
		"ticket": {
			"assignees": ["admin"],
			"type": "issue",
			"due": "today"
		}
	}
}
```

## Ví Dụ Payload

Đây là các payload JSON activity mẫu được gửi đến shell exec và web hook đơn giản. Lưu ý trong thực tế chúng đều được rút gọn thành một dòng duy nhất.

Alert Đã Kích Hoạt (`alert_new`):

```json
{
	"xy": 1,
	"alert": {
		"date": 1768336814,
		"exp": "memory.available < 1073741824",
		"message": "Server has low free memory: 906.2 MB",
		"count": 1,
		"notified": true,
		"id": "amkd22yuuryqbzol",
		"active": true,
		"alert": "amkd22ytorq8q9k3",
		"server": "saturn1",
		"groups": [
			"main",
			"prod"
		],
		"modified": 1768336814
	},
	"description": "New alert for: saturn1: Server has low free memory: 906.2 MB",
	"action": "alert_new",
	"epoch": 1768336814,
	"id": "amkd22yuurzr9emy",
	"keywords": [],
	"text": "New alert for: saturn1: Server has low free memory: 906.2 MB",
	"message": "New alert for: saturn1: Server has low free memory: 906.2 MB",
	"content": "New alert for: saturn1: Server has low free memory: 906.2 MB"
}
```

Lỗi Nghiêm Trọng (`critical`):

```json
{
	"xy": 1,
	"description": "Crash log was found on worker server.",
	"details": "**Log Contents:**\\n\\n```\\n(Actual crash log here)\n```\n",
	"server": "api-prod-01",
	"action": "critical",
	"epoch": 1768283576,
	"id": "amkc6dvvd1nci7tl",
	"keywords": [],
	"text": "Crash log was found on worker server.",
	"message": "Crash log was found on worker server.",
	"content": "Crash log was found on worker server."
}
```

Truy Cập Secret (`secret_access`), tức là một người dùng hoặc API key đã giải mã một secret vault:

```json
{
	"xy": 1,
	"secret": {
		"title": "Dev AI Creds",
		"enabled": false,
		"icon": "",
		"notes": "updated by joe",
		"plugins": [
			"shellplug"
		],
		"categories": [],
		"events": [],
		"web_hooks": [
			"example_hook"
		],
		"id": "zmkd22dfakpie2ns",
		"username": "testuser",
		"modified": 1768336787,
		"created": 1768336787,
		"revision": 3,
		"names": [
			"API_KEY"
		]
	},
	"keywords": [
		"zmkd22dfakpie2ns",
		"testuser",
		"::1"
	],
	"ip": "::1",
	"ips": [
		"::1"
	],
	"headers": {
		"content-type": "application/json",
		"accept-encoding": "gzip, deflate, br",
		"user-agent": "PTOps Unit Tester",
		"content-length": "26",
		"host": "localhost:6622",
		"connection": "keep-alive"
	},
	"username": "testuser",
	"description": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)",
	"action": "secret_access",
	"epoch": 1768336787,
	"id": "amkd22dlulih6e0r",
	"text": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)",
	"message": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)",
	"content": "Secret was accessed: Dev AI Creds (zmkd22dfakpie2ns)"
}
```

Cập Nhật Trạng Thái (`state_update`), tức là một người dùng hoặc API key đã chuyển đổi công tắc chính của scheduler:

```json
{
	"xy": 1,
	"key": "scheduler.enabled",
	"value": false,
	"ip": "::1",
	"ips": [
		"::1"
	],
	"headers": {
		"content-type": "application/json",
		"accept-encoding": "gzip, deflate, br",
		"user-agent": "PTOps Unit Tester",
		"content-length": "48",
		"host": "localhost:6622",
		"connection": "keep-alive"
	},
	"username": "testuser",
	"description": "Internal state updated: scheduler.enabled",
	"action": "state_update",
	"epoch": 1768336817,
	"id": "amkd230tlujovg4l",
	"keywords": [
		"testuser",
		"::1"
	],
	"text": "Internal state updated: scheduler.enabled",
	"message": "Internal state updated: scheduler.enabled",
	"content": "Internal state updated: scheduler.enabled"
}
```

Conductor Chính (`master_primary`), tức là một server conductor đã tiếp nhận vai trò vận hành chính:

```json
{
	"xy": 1,
	"host": "localhost",
	"description": "Conductor server is now primary: localhost",
	"action": "master_primary",
	"epoch": 1768336785,
	"id": "amkd22c1fbgcilb1",
	"keywords": [],
	"text": "Conductor server is now primary: localhost",
	"message": "Conductor server is now primary: localhost",
	"content": "Conductor server is now primary: localhost"
}
```

## Gợi Ý

- Gửi email khi có `critical` để page on-call và bao gồm chi tiết activity.
- Dùng web hook đã cấu hình để thông báo cho hệ thống xử lý sự cố như OpsGenie khi có `error` hoặc `critical`.
- Dùng hook firehose để đưa toàn bộ activity vào một pipeline log qua `shell_exec`.
