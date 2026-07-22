# Data Structures

## Overview

Tài liệu này trình bày chi tiết tất cả các cấu trúc dữ liệu nội bộ được sử dụng trong PTOps.

## Alert

Định nghĩa alert là một trigger chỉ định các điều kiện mà theo đó alert sẽ kích hoạt, và những actions nào sẽ diễn ra. Biểu thức alert có thể sử dụng bất kỳ giá trị dữ liệu server nào để xác định khi nào cần kích hoạt, ví dụ `cpu.currentLoad > 80`. Dưới đây là một ví dụ về alert ở định dạng JSON:

```json
{
	"id": "load_avg_high",
	"title": "High CPU Load",
	"expression": "monitors.load_avg >= (cpu.cores + 1)",
	"message": "CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)",
	"groups": [],
	"actions": [],
	"monitor_id": "load_avg",
	"enabled": true,
	"samples": 1,
	"notes": "",
	"username": "admin",
	"modified": 1434125333,
	"created": 1434125333
}
```

### Alert.id

Một ID gồm chữ và số viết thường duy nhất cho alert.

### Alert.title

Tiêu đề trực quan cho alert, được hiển thị trên giao diện người dùng và trong các thông báo.

### Alert.enabled

Một cờ boolean cho biết alert đã được bật hay chưa.

### Alert.icon

Một ID biểu tượng tùy chọn cho alert, được hiển thị trên giao diện người dùng. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### Alert.expression

Biểu thức định nghĩa các điều kiện mà theo đó alert sẽ kích hoạt. Biểu thức này có thể sử dụng bất kỳ giá trị dữ liệu server nào, ví dụ: `cpu.currentLoad > 80`. Định dạng của biểu thức là JavaScript.

### Alert.message

Tin nhắn cần bao gồm trong thông báo alert. Có thể bao gồm các placeholder mustache để chèn nội dung động. Ví dụ: `CPU load average is too high: {{float(monitors.load_avg)}} ({{cpu.cores}} CPU cores)`. Xem [Monitoring](monitors.md) để biết thêm về cú pháp này.

### Alert.groups

Các group server nơi alert đang hoạt động. Để trống để áp dụng cho tất cả các group.

### Alert.actions

Một tập hợp các [Actions](#action) cần thực hiện khi alert kích hoạt và/hoặc xóa. Danh sách này cũng có thể được bổ sung bởi group server.

### Alert.monitor_id

Tùy chọn liên kết alert với một monitor thông qua [ID](#monitor-id) của nó. Việc này sẽ hiển thị tag alert trên đầu biểu đồ monitor được chỉ định.

### Alert.samples

Số lần liên tiếp biểu thức phải đánh giá là `true` trước khi alert kích hoạt. Tương tự, đây cũng là thời gian "cooldown" của alert (biểu thức phải đánh giá là `false` với cùng số lần trước khi alert được coi là không hoạt động).

### Alert.exclusive_actions

Nếu được đặt thành `true`, alert sẽ không kế thừa các actions phổ quát hoặc của group.

### Alert.notes

Các ghi chú hoặc nhận xét tùy chọn về alert.

### Alert.username

Người dùng hoặc API Key đã tạo alert.
	
### Alert.modified

Dấu thời gian Unix khi alert được sửa đổi lần cuối.

### Alert.created

Dấu thời gian Unix khi alert được tạo.

### Alert.revision

Số sửa đổi nội bộ cho alert, tăng lên với mỗi thay đổi.

## APIKey

API Key là một định danh duy nhất được sử dụng để xác thực các yêu cầu. Dưới đây là một API key ở định dạng JSON:

```json
{
	"key": "ee39a49a200fc9c9be6122f46e49f7172c389d813dac360dc1b1173cd43e5328",
	"active": 1,
	"privileges": {
		"create_events": 1,
		"edit_events": 1,
		"run_jobs": 1,
		"tag_jobs": 1
	},
	"roles": [],
	"title": "Test App",
	"description": "For testing.",
	"id": "kme0thuforv",
	"username": "admin",
	"modified": 1754536104,
	"created": 1754536104,
	"revision": 1
}
```

### APIKey.id

Một ID gồm chữ và số viết thường duy nhất cho API Key.

### APIKey.key

Một mã băm SHA256 được thêm salt của key được sử dụng để xác thực các yêu cầu. Key thực tế không bao giờ được lưu trữ dưới dạng bản rõ.

### APIKey.title

Tiêu đề trực quan cho API Key, được hiển thị trên giao diện người dùng.

### APIKey.description

Một mô tả ngắn gọn về API Key và mục đích của nó.

### APIKey.active

Một cờ boolean cho biết API Key đang hoạt động hay bị vô hiệu hóa.

### APIKey.expires

Ngày hết hạn tùy chọn cho API Key, tính bằng giây Unix. Sau khi ngày/giờ này trôi qua, API Key không còn có thể được sử dụng.

### APIKey.username

Người dùng hoặc API Key đã tạo API Key.

### APIKey.modified

Dấu thời gian Unix khi API Key được sửa đổi lần cuối.

### APIKey.created

Dấu thời gian Unix khi API Key được tạo.

### APIKey.revision

Số sửa đổi nội bộ cho API Key, tăng lên với mỗi thay đổi.

### APIKey.privileges

Các đặc quyền được gán cho API Key, được chỉ định dưới dạng các khóa đối tượng. Xem [Privileges](#privileges) để biết thêm chi tiết.

### APIKey.roles

Các vai trò được gán cho API Key, được chỉ định dưới dạng một mảng. Các vai trò có thể tự động gán các đặc quyền. Xem [Role](#role) để biết thêm chi tiết.

## Bucket

Storage bucket là một bộ chứa logic để lưu trữ các tệp, sử dụng trong các events và workflows. Các buckets có thể chứa một số lượng tệp tùy ý và dữ liệu JSON. Dưới đây là một bucket ở định dạng JSON:

```json
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
```

Lưu ý rằng dữ liệu người dùng bucket và các tệp được lưu trữ riêng biệt, bên ngoài đối tượng bucket.

### Bucket.id

Một ID gồm chữ và số viết thường duy nhất cho bucket.

### Bucket.title

Tiêu đề trực quan cho bucket, được hiển thị trên giao diện người dùng.

### Bucket.enabled

Một cờ boolean cho biết bucket đã được bật hay chưa.

### Bucket.icon

Một ID biểu tượng tùy chọn cho bucket, được hiển thị trên giao diện người dùng. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### Bucket.notes

Các ghi chú hoặc nhận xét tùy chọn về bucket.

### Bucket.username

Người dùng hoặc API Key đã tạo bucket.

### Bucket.modified

Dấu thời gian Unix khi bucket được sửa đổi lần cuối.

### Bucket.created

Dấu thời gian Unix khi bucket được tạo.

### Bucket.revision

Số sửa đổi nội bộ cho bucket, tăng lên với mỗi thay đổi.

### Bucket.data

Dữ liệu người dùng được lưu trữ trong bucket. Dữ liệu này được lưu trữ riêng biệt với đối tượng bucket.

### Bucket.files

Một mảng các đối tượng [File](#file) trong bucket. Mảng này được lưu trữ riêng biệt với đối tượng bucket.

## Category

Category là một cách để nhóm các events liên quan lại với nhau. Mỗi event có thể thuộc về một category duy nhất. Dưới đây là một ví dụ về category ở định dạng JSON:

```json
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
```

### Category.id

Một ID gồm chữ và số viết thường duy nhất cho category.

### Category.enabled

Một cờ boolean cho biết category đã được bật hay chưa.

### Category.title

Tiêu đề trực quan cho category, được hiển thị trên giao diện người dùng.

### Category.icon

Một ID biểu tượng tùy chọn cho category, được hiển thị trên giao diện người dùng. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### Category.color

Màu sắc trực quan cho category, được hiển thị trên giao diện người dùng cho tất cả các events được gán vào category. Các giá trị màu có sẵn là: `plain`,  `red`, `green`, `blue`, `skyblue`, `yellow`, `purple`, và `orange`.

### Category.notes

Các ghi chú hoặc nhận xét tùy chọn về category.

### Category.username

Người dùng hoặc API Key đã tạo category.

### Category.modified

Dấu thời gian Unix khi category được sửa đổi lần cuối.

### Category.created

Dấu thời gian Unix khi category được tạo.

### Category.revision

Số sửa đổi nội bộ cho category, tăng lên với mỗi thay đổi.

### Category.sort_order

Thứ tự sắp xếp nội bộ cho category, được sử dụng để xác định vị trí của nó trong các danh sách.

### Category.actions

Một mảng các mục [Action](#action) để gọi tại nhiều thời điểm khác nhau trong quá trình chạy job. Các actions này tự động được áp dụng cho tất cả các events được gán vào category. Các events có thể định nghĩa các actions bổ sung, chúng được thêm vào cuối danh sách này vào thời gian chạy job.

### Category.limits

Một mảng các mục [Limit](#limit) để áp dụng cho các jobs đang chạy, ví dụ: giới hạn CPU và bộ nhớ. Trong giao diện người dùng, chúng được gọi là "Resource Limits". Chúng tự động được áp dụng làm mặc định cho tất cả các events được gán vào category. Các events có thể định nghĩa các limits bổ sung *hoặc ghi đè limits của category* (được khớp theo type).

## Channel

Notification channel là một cách để gửi thông báo cho một nhóm người dùng, và kích hoạt các actions hệ thống khác như web hooks, khi các actions event nhất định xảy ra. Dưới đây là một ví dụ về channel ở định dạng JSON:

```json
{
	"id": "sev1",
	"title": "Severity 1",
	"enabled": true,
	"username": "admin",
	"modified": 1754603045,
	"created": 1754365754,
	"notes": "For major events that require everyone's attention right away.",
	"users": [
		"admin"
	],
	"email": "",
	"web_hook": "",
	"run_event": "",
	"sound": "attention-3.mp3",
	"icon": "",
	"revision": 3,
	"max_per_day": 0
}
```

### Channel.id

Một ID gồm chữ và số viết thường duy nhất cho channel.

### Channel.title

Tiêu đề trực quan cho channel, được hiển thị trên giao diện người dùng.

### Channel.enabled

Một cờ boolean cho biết channel đã được bật hay chưa.

### Channel.icon

Một ID biểu tượng tùy chọn cho channel, được hiển thị trên giao diện người dùng. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### Channel.users

Một mảng [User.username](#user-username) đã đăng ký theo dõi channel, và sẽ nhận được email và thông báo UI cho các events của channel.

### Channel.email

Địa chỉ email tùy chọn (hoặc danh sách phân tách bằng dấu phẩy) để gửi thông báo cho các events của channel.

### Channel.web_hook

Một [WebHook.id](#webhook-id) tùy chọn để gửi thông báo cho các events của channel.

### Channel.run_event

Một [Event.id](#event-id) tùy chọn để chạy khi channel được kích hoạt.

### Channel.sound

Hiệu ứng âm thanh tùy chọn để phát cho tất cả người dùng đã đăng ký khi channel được kích hoạt. Đây phải là một tên tệp có phần mở rộng `.mp3`. Xem [Sound Effects](https://github.com/pixlcore/xyops/htdocs/sounds/) để biết danh sách các hiệu ứng âm thanh có sẵn để chọn.

### Channel.max_per_day

Số lần tối đa tùy chọn mà channel có thể được kích hoạt mỗi ngày.

### Channel.notes

Các ghi chú hoặc nhận xét tùy chọn về channel.

### Channel.revision

Số sửa đổi nội bộ cho channel, tăng lên với mỗi thay đổi.

## Event

Event là một mục trên lịch trình khởi chạy các [Jobs](#job). Nó có thể được lên lịch để chạy vào những thời điểm cụ thể hoặc không (nghĩa là nó chỉ có thể được chạy theo yêu cầu). Dưới đây là một ví dụ về event ở định dạng JSON:

```json
{
	"id": "event100",
	"title": "Diverse heuristic complexity",
	"enabled": true,
	"username": "admin",
	"modified": 1653843747,
	"created": 1651348186,
	"category": "cat9",
	"targets": [
		"main"
	],
	"notes": "This is a test event.",
	"limits": [
		{
			"type": "time",
			"enabled": true,
			"duration": 3600
		}
	],
	"actions": [
		{
			"enabled": true,
			"condition": "error",
			"type": "email",
			"email": "admin@localhost"
		}
	],
	"plugin": "shellplug",
	"params": {
		"script": "#!/bin/bash\n\nsleep 30;\necho HELLO;\n",
		"annotate": false,
		"json": false
	},
	"triggers": [
		{
			"type": "schedule",
			"enabled": true,
			"hours": [
				19
			],
			"minutes": [
				6
			]
		}
	],
	"icon": "",
	"tags": [
		"important"
	],
	"algo": "random"
}
```

Các events có các thuộc tính sau:

### Event.id

Một ID gồm chữ và số viết thường duy nhất cho event.

### Event.title

Tiêu đề trực quan cho event, được hiển thị trên giao diện người dùng.

### Event.enabled

Một cờ boolean cho biết event đã được bật (có thể chạy jobs) hay bị vô hiệu hóa.

### Event.icon

An optional icon ID for the event, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

### Event.category

The [Category.id](#category-id) of the category to which the event belongs.

### Event.plugin

The [Plugin.id](#plugin-id) of the plugin which will handle running jobs.

### Event.params

An object containing key/value pairs which is passed to the job process.  These are typically defined by the [Plugin](#plugin) and populated in the UI.

### Event.fields

An optional array of user-defined parameter definitions that are collected when a job is started manually in the UI, and then the values are merged into the [Event.params](#event-params) object.

See [Plugin.params](#plugin-params) for details on the format of the objects in this array.

### Event.tags

An array of [Tag](#tag) IDs which can be used to search for historical jobs.  The running job may also modify this list.

### Event.targets

An array of server or group targets to run the event.  Each item of the array is a string, and can can either be a [Server.id](#server-id) or a [Group.id](#group-id).

### Event.expression

An optional expression in [PTOps Expression Format](xyexp.md), which can further reduce the set of candidate servers for targeting jobs.  Must use in conjunction with [Event.targets](#event-targets).  See [Target Expressions](events.md#target-expressions) for details.

### Event.algo

When multiple servers are in the [Event.targets](#event-targets) array, PTOps uses an algorithm to select a server to run the job.  The available algorithms are:

| Algorithm | Notes |
|-----------|-------|
| `random` | Randomly pick a server from the list. |
| `round_robin` | Pick each server in sequence, then repeat. |
| `least_cpu` | Pick the server with the least CPU usage. |
| `least_mem` | Pick the server with the least memory usage. |
| `prefer_first_natural` | Prefer the first server when naturally sorted by the [Event.targets](#event-targets). |
| `prefer_last_natural` | Prefer the last server when naturally sorted by the [Event.targets](#event-targets). |
| `prefer_first` | Prefer the first server when alphabetically sorted by label or hostname. |
| `prefer_last` | Prefer the last server when alphabetically sorted by label or hostname. |
| `monitor:_ID_` | Pick the server with the lowest custom monitor value, specified by [Monitor.id](monitor-id) with a `monitor:` prefix. |

### Event.notes

Optional notes for the event, which are included in email notifications for event actions.

### Event.actions

An array of [Action](#action) items to invoke at various points during job runs.

The event's [Category](#category) can define additional actions which are appended to this list at job run time.

### Event.limits

An array of [Limit](#limit) items to apply to running jobs, e.g. CPU and memory limits.  In the UI these are referred to as "Resource Limits".

The event's [Category](#category) can define limits which act as defaults to the event limits.

### Event.triggers

An array of [Trigger](#trigger) items to schedule future job runs and set rules, e.g. blackout dates.

### Event.workflow

If the event is a workflow, this contains detailed information about the nodes and connections.  See the [Workflow](#workflow) section for details.

### Event.revision

An internal revision number for the event, incremented with each change.

## Group

A server group is a collection of servers, usually auto-matched by hostname, but you can also manually assign servers to groups.  Here is an example group in JSON format:

```json
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
```

### Group.id

A unique lowercase alphanumeric ID for the group.

### Group.title

A visual name for the group, displayed in the UI.

### Group.icon

An optional icon ID for the group, displayed in the UI.  Icons are sourced from [Material Design Icons](https://materialdesignicons.com/).

### Group.hostname_match

A hostname pattern used to match servers to the group.  This should be a [regular expression](https://en.wikipedia.org/wiki/Regular_expression) wrapped in a string.

### Group.alert_actions

A set of [Actions](#action) to perform when **any** alert fires and/or clears on a server in the group.

### Group.notes

Optional notes for the group, which are included in email notifications for group actions.

### Group.revision

An internal revision number for the group, incremented with each change.

### Group.sort_order

An integer value representing the sort order of the group.  Lower values are sorted first.

### Group.max_jobs_per_server

An optional default job concurrency limit to place on each server in the group.  Set to `0` for infinite.  Individual servers may override this via [Server.maxJobs](#server-maxjobs).

## Job

A job is a running (or previously ran) instance of an event.  The job structure has nearly all the same properties as [Event](#event) with these differences:

| Property Name | Note |
|---------------|--------|
| `id` | Replaced with [Job.id](#job-id). |
| `event` | The [Event.id](#event-id]) of the event which spawned the job. |
| `title` | Removed from job structure when event is copied. |
| `enabled` | Removed from job structure when event is copied. |
| `created` | Removed from job structure when event is copied. |
| `modified` | Removed from job structure when event is copied. |
| `triggers` | Removed from job structure when event is copied. |

And these additions:

### Job.id

An auto-generated, unique, lowercase alphanumeric ID for the job, which will always start with a `j`.

### Job.type

An optional string representing a custom job type.  Values include:

| Job Type | Note | 
|----------|------|
| `workflow` | Job is a top-level workflow control job, which will spawn sub-jobs. | 
| `adhoc` | Job is running as an ad-hoc under a workflow, with no event attached. | 

### Job.event

The [Event.id](#event-id) of the event which spawned the job.

### Job.server

Which [Server.id](#server-id) that was chosen to run the job, based on the [Event.algo](#event-algo).

### Job.groups

When a server is chosen, that server's assigned groups are copied into the job.

### Job.command

Which executable to run for the job.  This cannot be set -- it is copied from the [Plugin](#plugin).

### Job.script

The script which, if present, is written and cached on disk, and then appended onto the [Job.command](#job-command) as a file argument.  This cannot be set -- it is copied from the [Plugin](#plugin).

### Job.uid

Which UID (User ID) to run the job process as.  This cannot be set -- it is copied from the [Plugin](#plugin).

### Job.cwd

Which CWD (Current Working Directory) run the job process under.  This cannot be set -- it is copied from the [Plugin](#plugin).

### Job.env

Custom job environment variables to inject into the executable when spawning it.  If unset, this is copied from the `job_env` global configuration property.

### Job.state

Specifies which state the job is currently in.  Here is a list of all the possible states:

| Job State | Description |
|-----------|-------------|
| `queued` | Job is queued and waiting for an open slot to move to `ready` state. |
| `start_delay` | Job has a custom starting delay.  The timestamp at which the delay expires should be in [Job.until](#job-until). |
| `retry_delay` | Job is currently in a retry delay.  The timestamp at which the delay expires should be in [Job.until](#job-until). |
| `ready` | Job is ready to start. |
| `starting` | Job is in the process of starting (running start actions). |
| `active` | Job is currently active (running). |
| `finishing` | Job is finishing (uploading logs and/or files). |
| `complete` | Job is complete. |

### Job.started

The timestamp at which the job was started (Unix seconds).  Specifically this is when the job was moved to a `ready` state.

### Job.updated

The timestamp at which the job was last updated (Unix seconds).

### Job.completed

The timestamp at which the job was completed (Unix seconds).

### Job.elapsed

The duration of the job run in seconds (calculated as the difference between [Job.started](#job-started) and [Job.completed](#job-completed)).  This does not include time spent in queue or start delay.

### Job.now

The job's "now" time, as an Unix timestamp, which is the time at which the job was originally scheduled to launch.  This timestamp may be in the past if the job is running as part of a catch-up operation.

### Job.code

When a job completes, the `code` denotes the result.  Zero (`0`) means success, any other value means the job failed.  You can use this to specify your own internal error code, or just specify `1` for a generic error.  Any number or string is acceptable.  There are a few special values that PTOps recognizes:

| Job Code | Meaning |
|----------|---------|
| `warning` | This denotes that a job failed by only with a "warning", not a full error. |
| `critical` | This denotes that the job failed critically, and needs immediate attention. |
| `abort` | This denotes that the job was manually aborted, either by a user or an API call. |

### Job.description

When a job fails, the `description` property can contain a summary of the error message.

### Job.remote

Set to `true` when the job has an active remote server connection (job request was sent to remote server).

### Job.until

Specifies the timestamp at which point the job can be moved into a ready state.  This property is used by the `start_delay` and `retry_delay` states.

### Job.progress

Optional user-populated progress indicator, which should be a floating point number between `0.0` to `1.0`.  Both extremes (`0.0` and `1.0`) display as "indeterminate" in the UI.

### Job.status

Optional user-populated status string, which is displayed on the live job detail screen while the job is in progress.  It is shown just under the progress bar, replacing the summary box title heading.

### Job.suspended

Will be set to `true` if job is currently suspended, awaiting user action.  See [Suspend Job](actions.md#suspend-job) for details.

### Job.reconnected

A Unix timestamp of when the primary server socket was reconnected, during a job run.  The presence of this property indicates that the worker server lost its connection to the primary during the job, and then reconnected later.

### Job.log_file

An optional log file for the user to write/append to, during a job.  This is a legacy carryover from Cronicle.  If present at the completion of a job, the file will be uploaded as an attachment.

### Job.log_file_size

The size of the actual job output, in bytes, and updated continuously as job runs.  This is the STDOUT and STDERR captured from the job process, and is not associated with the legacy [Job.log_file](#job-log_file) property.

### Job.activity

An array of meta log entries for the job.

### Job.source

A string ID indicating what spawned the job.  This will be one of:

| Source | Description |
|--------|-------------|
| `scheduler` | Job was spawned normally via the scheduler. |
| `plugin` | Job was spawned from a Scheduler Plugin. |
| `key` | Job was spawned via a HTTP request to the `run_event` API using an API Key.  There will be an additional property named `key` containing the internal API Key ID (non-secret). |
| `user` | Job was spawned manually via user request in the UI.  There will be an additional property named `username` containing the username of the user who initiated the action. |
| `action` | Job was spawned by a custom job action (i.e. start, complete, success or fail action condition).  [Job.parent](#job-parent) will also be present in this case. |
| `alert` | Job was spawned by an alert notification from the server monitoring system. |
| `workflow` | Job was spawned as part of a workflow sequence. |
| `magic` | Job was spawned as part of a magic link. |
| `startup` | Job was spawned as part of a startup trigger. |

### Job.parent

When the job was launched from another job (custom action or workflow step), this will contain information about the parent job which spawned the current job.  It will be an object with the following properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| `job` | String | The [Job.id](#job-id) of the job which launched the current job. |
| `event` | String | The [Event.id](#event-id) of the job which launched the current job. |
| `code` | Mixed | The [Job.code](#job-code) of the job which launched the current job. |
| `description` | String | The [Job.description](#job-description) of the job which launched the current job. |

### Job.input

When another job passes data or files to the current job, an `input` object is populated.  The object may have the following properties:

| Property Name | Type | Description |
|---------------|------|-------------|
| `data` | Object | A user-defined object containing arbitrary data for the job. |
| `files` | Array | An array of files supplied to the job, from a previous job, storage bucket, or trigger plugin |

The format of the `data` object is freeform, and completely user-defined.  The `files` array will be formatted the same as [Job.files](#job-files).

### Job.retried

Boolean, will be set to `true` when a job was retried, and another job exists in the same set.

### Job.retry_count

For retried jobs, a retry counter is present that counts upwards for each new retry.  It will not exceed the retry [limit](#limit) set in the event.

### Job.retry_prev

When a job is a retry, this property will contain the [Job.id](#job-id) of the previous attempt.

### Job.jobs

When a job launches other jobs, either by retry or action condition, the newly launched jobs will be added to a `jobs` array in the parent (source) job.  Each item in the array is an object with `id` and `reason` properties.  The reason can be one of `action` or `retry`.

### Job.cpu

This will contain information about the job process CPU usage.

### Job.mem

This will contain information about the job process memory usage.

### Job.disk

This will contain information about the job process disk usage.

### Job.net

This will contain information about the job process network usage (open TCP connections).

### Job.data

This is a place where the job can store arbitrary data, which will be passed to the next job (if part of a workflow, or launched via an action).

### Job.files

This will contain information about all uploaded files for the job.  While the job is running, the user can populate this array to attach files for the job.  Each item in the array can be a simple string (file path or glob), a sub-array of file path and filename, a sub-array of file path, filename, and a `true` boolean to delete the file after uploading, or an object with the following properties:

| Property Name | Description |
|---------------|-------------|
| `path` | Path to the file on disk, or a glob matching multiple files. |
| `filename` | Custom destination filename to use when uploading.  Do not combine with a glob path. |
| `delete` | Set this to `true` to delete the file(s) after uploading. |

Once the job is complete, the files will be uploaded and the array will be recreated as an array of objects, one per file, with each object following the [File](#file) structure.

### Job.update_event

This allows the user job code to update the event at time of completion.  For example, here is how you would disable the event:

```sh
echo '{ "xy":true, "update_event": { "enabled": false } }'
```

### Job.push

A system by which the user code can push new [actions](#action) and [limits](#limit) onto the job while it is still running.  For example:

```sh
echo '{ "xy":true, "push": { "actions": [ { "condition":"success", "type":"email", "email":"you@yourdomain.com" } ] } }'
```

### Job.procs

An array of process IDs (PIDs) and additional process information that are associated with the job.

### Job.conns

An array of network connections (TCP/UDP) and additional metadata that are associated with the job.

### Job.timelines

An array of timeline events that occurred during the job's execution.  This data is used to plot the CPU/Mem/Disk/Net graphs for the job.

### Job.table

User writable property for providing a table of data.  Should be specified as an object with `title`, `rows`, `cols` and `caption` properties.  The `title` and `caption` may be omitted.

### Job.html

User writable property for providing a HTML-formatted report.  Should be specified as an object with `title`, `content` and `caption` properties.  The `title` and `caption` may be omitted.

### Job.markdown

User writable property for providing a markdown-formatted report.  Should be specified as an object with `title`, `content` and `caption` properties.  The `title` and `caption` may be omitted.  This gets converted to HTML on the back-end.

### Job.text

User writable property for providing a text-formatted report.  Should be specified as an object with `title`, `content` and `caption` properties.  The `title` and `caption` may be omitted.  This gets converted to HTML using a `<pre>` element.

### Job.stype

This is set to a string when a job is launched via a special scheduler trigger like "single" (single-shot) or "interval".  Only used for UI hinting.

### Job.splugin

This is set to a Plugin ID by the scheduler when a job was launched from a Plugin based trigger configuration.  Only used for UI hinting.

### Job.pid

When the job starts running on a server, this will contain the local PID of the process directly spawned by xySat.

### Job.rpid

When the job is running via a remote script layer (i.e. Docker container or remote SSH via [xyRun](https://github.com/pixlcore/xyrun)), this will contain the actual root PID of the remote job process group.

### Job.label

User writable property for providing a visual label for the Job.  Should be specified as a string, and will be displayed alongside the Job ID on completion screens and history lists.

### Job.test

This is set to `true` when the job was fired from an event test.  This is used to override the event enabled check, and add hints to the UI.

### Job.secrets

If any secrets were assigned to the job, this object will *temporarily* hold the decrypted key/value pairs for the job code to use.  They are **not** stored anywhere, and only passed to the Event Plugin running the job for immediate use.

### Job.base_url

While the job is running, i.e. in the data passed to the Event Plugin, the job object will contain a `base_url` property.  This will be a fully-qualified URL pointing to the current primary conductor server, using the same protocol, hostname and port that xySat used to connect.  This is useful if your job needs to call any PTOps APIs directly.

### Job.workflow

When the job is itself a workflow, or a sub-job inside a workflow, this object will contain additional information.  See [JobWorkflow](#jobworkflow) for details.

### Job.tickets

An array of [Ticket.id](#ticket-id)s associated with the job.

### Job.position

If the [Job.state](#job-state) is `queued`, this property will indicate what position the job is currently sitting in the queue.
### Job.serverData

Trong khi job đang chạy, nghĩa là trong dữ liệu được truyền đến Event Plugin trên server từ xa, đối tượng job sẽ chứa thuộc tính `serverData`.  Đây sẽ là một bản sao của đối tượng [Server.userData](#server-userdata), nếu có thể áp dụng cho server hiện tại.

### Job.workflowData

Trong khi job đang chạy, nghĩa là trong dữ liệu được truyền đến Event Plugin trên server từ xa, đối tượng job có thể chứa thuộc tính `workflowData`, nếu job là một workflow sub-job.  Đối tượng này sẽ chứa dữ liệu do người dùng chỉ định được chia sẻ trên tất cả các sub-job trong workflow.

Bất kỳ workflow sub-job nào cũng có thể ghi vào dữ liệu này bằng cách chỉ định đối tượng `workflowData` được điền sẵn trong output của chúng.  Dữ liệu mới sẽ được shallow-merge với dữ liệu workflow hiện có, khi sub-job hoàn thành.

### Job.invisible

Nếu được đặt thành `true`, job đang chạy ẩn đối với UI.  Xem [Quiet Trigger](triggers.md#quiet) để biết chi tiết.

### Job.ephemeral

Nếu được đặt thành `true`, job sẽ tự xóa sau khi hoàn thành.  Xem [Quiet Trigger](triggers.md#quiet) để biết chi tiết.

### Job.versions

Trong khi job đang chạy, nghĩa là trong dữ liệu được truyền đến Event Plugin trên server từ xa, đối tượng job sẽ chứa thuộc tính `versions`.  Đây sẽ là một đối tượng chứa các số phiên bản khác nhau mà job có thể sử dụng để xác định tính khả dụng của tính năng, v.v.  Ví dụ:

```json
"versions": {
	"xyops": "1.0.42",
	"xysat": "1.0.14"
}
```

### Job.priority

Nếu được đặt thành `true` và việc xếp hàng được bật trên event, các job mới có độ ưu tiên sẽ nhảy lên đầu hàng đợi, trước các job không có độ ưu tiên.

## Monitor

Monitor theo dõi một số liệu server bằng số cụ thể.  Chúng được vẽ biểu đồ trong UI để bạn có thể xem các xu hướng theo thời gian và bạn cũng có thể chỉ định các alert vào chúng.  Dưới đây là ví dụ về monitor ở định dạng JSON:

```json
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
```

### Monitor.id

Một ID chữ và số viết thường duy nhất cho monitor.

### Monitor.title

Một tiêu đề trực quan cho monitor, được hiển thị trong UI.

### Monitor.display

Một cờ boolean cho biết liệu monitor có được hiển thị trong UI hay không.

### Monitor.icon

Một ID biểu tượng tùy chọn cho monitor, được hiển thị trong UI.  Các biểu tượng có nguồn gốc từ [Material Design Icons](https://materialdesignicons.com/).

### Monitor.groups

Một mảng các ID server group mà monitor sẽ theo dõi.

### Monitor.source

Một biểu thức trỏ đến nguồn dữ liệu cho giá trị của monitor.  Điều này có thể trỏ đến bất kỳ giá trị dữ liệu server nào, ví dụ: `cpu.currentLoad`.  Định dạng của biểu thức là JavaScript.  Xem [ServerMonitorData](#servermonitordata) cho cấu trúc dữ liệu mà biểu thức này lấy từ đó.

### Monitor.data_match

Nếu nguồn monitor trỏ tới một chuỗi văn bản, bạn có thể cung cấp biểu thức chính quy trong trường này để lấy ra một giá trị dữ liệu số duy nhất từ văn bản.  Điều này thường được sử dụng với các lệnh tùy chỉnh (Monitor Plugin).

### Monitor.data_type

Kiểu dữ liệu của giá trị monitor.  Điều này có thể là một trong số: `integer`, `float`, `bytes`, `seconds` hoặc `milliseconds`.

### Monitor.min_vert_scale

Điều này cho phép bạn thiết lập thang tỷ lệ dọc tối thiểu (phạm vi) trong các biểu đồ trực quan cho monitor.  Ví dụ: các monitor hiển thị phần trăm (nghĩa là mức sử dụng CPU) có thể cần thang tỷ lệ dọc tối thiểu là `100`.

### Monitor.suffix

Tùy chọn hiển thị hậu tố cho giá trị của monitor.  Điều này có thể hữu ích để chỉ ra các đơn vị (ví dụ: `%`, `MB`, `ms`, v.v.).

### Monitor.delta

Khi được đặt thành true, điều này sẽ coi giá trị của monitor là delta (nghĩa là sự thay đổi giá trị theo thời gian) thay vì một giá trị tuyệt đối.  Điều này hữu ích cho các số liệu server được đo dưới dạng bộ đếm tuyệt đối, chẳng hạn như lưu lượng mạng Linux hoặc disk I/O.

### Monitor.divide_by_delta

Khi được thiết lập, điều này sẽ chia giá trị của monitor cho khoảng thời gian giữa các lần lấy mẫu trước khi hiển thị nó.  Điều này hữu ích cho việc chuyển đổi các giá trị tuyệt đối thành các tỷ lệ (ví dụ: byte trên giây).

### Monitor.delta_min_value

Khi được thiết lập, điều này sẽ chỉ định giá trị tối thiểu cho delta được tính toán của monitor. Điều này hữu ích để ngăn một delta monitor hiển thị một mức tăng đột biến âm khổng lồ do sự sụt giảm ngắn gọn trong giá trị được giám sát tuyệt đối (chẳng hạn như khi một server được khởi động lại hoặc reset bộ đếm tuyệt đối của nó).

Điều này nên được đặt thành `false` để vô hiệu hóa hoặc bất kỳ số hợp lệ nào để bật nó, bao gồm cả `0`.

### Monitor.notes

Các ghi chú hoặc nhận xét tùy chọn về mục đích hoặc cấu hình của monitor.

### Monitor.revision

Số bản sửa đổi nội bộ cho monitor, được tăng lên với mỗi lần thay đổi.

### Monitor.sort_order

Một giá trị số nguyên đại diện cho thứ tự sắp xếp của monitor.  Các giá trị thấp hơn được sắp xếp đầu tiên.

## Plugin

Các plugin được sử dụng để mở rộng PTOps theo nhiều cách khác nhau, bao gồm các hành động event tùy chỉnh, server monitor và các tiện ích mở rộng lịch trình.  Để biết thêm chi tiết, hãy xem [Plugins](plugins.md).  Dưới đây là một ví dụ về plugin ở định dạng JSON:

```json
{
	"id": "shellplug",
	"title": "Shell Script",
	"enabled": 1,
	"command": "[shell-plugin]",
	"username": "admin",
	"type": "event",
	"modified": 1754365754,
	"created": 1754365754,
	"params": [
		{
			"id": "script",
			"type": "code",
			"title": "Script Source",
			"value": "#!/bin/sh\n\n# Enter your shell script code here",
			"locked": true
		},
		{
			"id": "annotate",
			"type": "checkbox",
			"title": "Add Date/Time Stamps to Log",
			"value": false
		},
		{
			"id": "json",
			"type": "checkbox",
			"title": "Interpret JSON in Output",
			"value": false
		}
	],
	"revision": 1
}
```

### Plugin.id

Một ID chữ và số viết thường duy nhất cho plugin.

### Plugin.title

Một tiêu đề trực quan cho plugin, được hiển thị trong UI.

### Plugin.enabled

Một cờ boolean cho biết liệu plugin có được bật hay không.

### Plugin.icon

Một ID biểu tượng tùy chọn cho plugin, được hiển thị trong UI.  Các biểu tượng có nguồn gốc từ [Material Design Icons](https://materialdesignicons.com/).

### Plugin.type

Loại của plugin, xác định hành vi và khả năng của nó. Các loại được hỗ trợ bao gồm `event`, `monitor`, `action` và `scheduler`.

### Plugin.command

Nhập đường dẫn filesystem đến tệp thực thi của bạn, bao gồm bất kỳ đối số dòng lệnh nào bạn yêu cầu.  Đây có thể là một trình thông dịch như `/bin/sh` hoặc `/usr/bin/python`, hoặc binary tùy chỉnh của riêng bạn.  Không bao gồm bất kỳ đường ống hoặc chuyển hướng nào ở đây.

### Plugin.script

Tập lệnh để thực thi cho plugin, là tùy chọn và phụ thuộc vào lệnh. Đây có thể là shell script, Python script hoặc bất kỳ mã nguồn nào khác.  Điều này được thêm vào [Plugin.command](#plugin-command) (thông qua một tệp tạm thời) khi Plugin được khởi chạy.

### Plugin.params

Một tập hợp các tham số tùy chỉnh để truyền cho plugin khi nó được thực thi (chỉ dành cho các Plugin không phải monitor).  Đây là các định nghĩa tham số, sau đó người dùng sẽ điền vào trong UI khi thiết lập các event / workflow.  Mỗi mục trong mảng `params` phải là một đối tượng có các thuộc tính sau:

| Property Name | Type | Mô tả |
|---------------|------|-------------|
| `id` | String | ID chữ và số viết thường cho tham số (cũng có thể chứa dấu gạch dưới). |
| `title` | String | Tiêu đề trực quan cho tham số, được hiển thị trong UI. |
| `type` | String | ID loại tham số, phải là một trong các giá trị: `text`, `textarea`, `code`, `json`, `checkbox`, `select`, `bucket`, `system`, `hidden`, `toolset` hoặc `group`. |
| `variant` | String | Đối với các điều khiển loại `text`, bạn có thể tùy chọn đặt một biến thể đầu vào UI: `color`, `date`, `datetime-local`, `email`, `number`, `text`, `time`, `tel` hoặc `url`. |
| `value` | Mixed | Giá trị mặc định cho tham số. |
| `data` | Object | Cụ thể cho loại `toolset`, thuộc tính này chứa tất cả các chi tiết công cụ. |
| `caption` | String | Tùy chọn hiển thị chú thích dưới điều khiển UI. |
| `required` | Boolean | Đặt giá trị này thành `true` để yêu cầu nhập một giá trị cho tham số. |
| `locked` | Boolean | Đặt giá trị này thành `true` để khóa chỉnh sửa chỉ dành cho quản trị viên. |

### Plugin.groups

Chỉ dành cho các monitor plugin, điều này xác định các server group mà plugin sẽ chạy trên đó mỗi phút, để thu thập số liệu.

### Plugin.format

Chỉ dành cho các monitor plugin, điều này xác định định dạng đầu ra mà Plugin tạo ra.  Các định dạng được hỗ trợ là `text`, `json` và `xml`.

### Plugin.uid

Đây là UID (tài khoản người dùng) để chạy plugin bên dưới.  UID có thể là số hoặc chuỗi ('root', 'www', v.v.).

### Plugin.gid

Đây là GID (tài khoản nhóm) để chạy plugin bên dưới.  GID có thể là số hoặc chuỗi ('wheel', 'admin', v.v.).

### Plugin.kill

Chuỗi này chỉ định cách xySat sẽ chấm dứt các tiến trình khi một job bị hủy bỏ.  Điều này chỉ được sử dụng cho Event Plugin.  Các giá trị được chấp nhận như sau:

- `none` có nghĩa là **không có** tiến trình nào bị kill khi hủy bỏ.  Điều này chỉ được sử dụng cho các trường hợp rất đặc biệt.
- `parent` có nghĩa là chỉ có tiến trình **cha** bị kill khi hủy bỏ.  Đây là hành vi mặc định cho các Plugin mới.
- `all` có nghĩa là **tất cả** các tiến trình bị kill khi hủy bỏ.  Nghĩa là, xySat sẽ duyệt cây tiến trình từ tiến trình cha xuống và kill mọi thứ.

### Plugin.runner

Boolean này, khi là `true`, chỉ ra rằng job sẽ chạy từ xa (nghĩa là không phải là một tiến trình con trực tiếp của xySat).  Điều này chỉ được sử dụng cho Event Plugin.

Ý tưởng là khi một job đang chạy từ xa, chúng ta không thể giám sát tài nguyên hệ thống cho nó.  Ngoài ra, các tệp đầu vào và đầu ra đơn giản là không hoạt động trong các trường hợp này (bởi vì xySat hy vọng chúng ở trên filesystem cục bộ nơi nó đang chạy).  Thuộc tính `runner` cho PTOps (và cuối cùng là xySat) biết rằng job đang chạy từ xa ngoài tầm với của nó và nó không nên thực hiện giám sát tiến trình và mạng thông thường, cũng như quản lý tệp.  Các nhiệm vụ đó được ủy quyền cho một công cụ như [xyRun](https://github.com/pixlcore/xyrun).

### Plugin.notes

Các ghi chú hoặc nhận xét tùy chọn về mục đích hoặc cấu hình của plugin.

### Plugin.revision

Số bản sửa đổi nội bộ cho plugin, được tăng lên với mỗi lần thay đổi.

### Plugin.marketplace

Sẽ chứa siêu dữ liệu [Plugin Marketplace](marketplace.md) nếu Plugin có nguồn gốc từ một bản cài đặt trên marketplace.  Ví dụ:

```json
"marketplace": {
	"id": "pixlcore/xyplug-bluesky",
	"version": "v1.0.7"
}
```

## Role

Một role người dùng là một tập hợp các quyền được cấp cho người dùng trong hệ thống.  Một người dùng có thể được gán nhiều role và tất cả các quyền của role được hợp nhất và truyền cho người dùng.  Một role cũng có thể bao gồm các hạn chế về category và/hoặc group, các hạn chế này cũng được áp dụng cho những người dùng được gán.  Dưới đây là một ví dụ về role ở định dạng JSON:

```json
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
```

### Role.id

Một ID chữ và số viết thường duy nhất cho role.

### Role.title

Một tiêu đề trực quan cho role, được hiển thị trong UI.

### Role.enabled

Một cờ boolean cho biết liệu role có được bật hay không.

### Role.icon

Một ID biểu tượng tùy chọn cho role, được hiển thị trong UI.  Các biểu tượng có nguồn gốc từ [Material Design Icons](https://materialdesignicons.com/).

### Role.privileges

Danh sách các quyền được gán cho role.  Mỗi quyền được biểu diễn dưới dạng một cặp key-value, trong đó key là tên quyền và value không được sử dụng.  Xem [Privileges](privileges.md) để biết thêm thông tin.

### Role.categories

Danh sách các category mà role được phép truy cập.

### Role.groups

Danh sách các group mà role được phép truy cập.

### Role.notes

Các ghi chú hoặc nhận xét tùy chọn về mục đích hoặc cấu hình của role.

### Role.username

Người dùng hoặc API Key đã tạo role.

### Role.modified

Timestamp Unix khi role được sửa đổi lần cuối.

### Role.created

Timestamp Unix khi role được tạo.

### Role.revision

Số bản sửa đổi nội bộ cho role, được tăng lên với mỗi lần thay đổi.

## Secret

Một secret là một bộ sưu tập các cặp key/value tất cả đều được lưu trữ bằng cách sử dụng mã hóa mạnh.  Xem [Secrets](secrets.md) để biết thêm chi tiết.  Dưới đây là một ví dụ về secret ở định dạng JSON:

```json
{
	"id": "zmeejkeb8nu",
	"title": "Dev Database Creds",
	"enabled": true,
	"icon": "",
	"notes": "This secret provides access to the dev database.",
	"names": [
		"DB_HOST",
		"DB_PASS",
		"DB_USER"
	],
	"events": [
		"emeekm2ablu"
	],
	"categories": [],
	"plugins": [],
	"username": "admin",
	"modified": 1757204132,
	"created": 1755365953,
	"revision": 8,
	"web_hooks": [
		"example_hook"
	]
}
```

### Secret.id

Một ID chữ và số viết thường duy nhất cho secret.

### Secret.title

Một tiêu đề trực quan cho secret, được hiển thị trong UI.

### Secret.enabled

Một cờ boolean cho biết liệu secret có được bật hay không.

### Secret.icon

Một ID biểu tượng tùy chọn cho role, được hiển thị trong UI.  Các biểu tượng có nguồn gốc từ [Material Design Icons](https://materialdesignicons.com/).

### Secret.fields

Một mảng các trường bí mật (secret fields).  Chúng được lưu trữ dưới dạng mã hóa.  Mỗi phần tử của mảng phải là một đối tượng có các thuộc tính sau:

| Property Name | Type | Mô tả |
|---------------|------|-------------|
| `name` | String | Tên của biến, ví dụ: `DB_PASSWORD`.  Sử dụng các quy tắc đặt tên biến môi trường POSIX tiêu chuẩn. |
| `value` | String | Giá trị của biến, ví dụ: `CorrectHorseBatteryStaple`. |

Các giá trị secret luôn được lưu trữ dưới dạng chuỗi (vì chúng được phân phối thông qua các biến môi trường).  Nếu bạn cần lưu trữ dữ liệu nhị phân trong một secret, bạn có thể mã hóa nó bằng [Base64](https://en.wikipedia.org/wiki/Base64).

### Secret.names

Một danh sách được tạo tự động chứa các tên trường, được lưu trữ dưới dạng văn bản thuần túy (cho mục đích hiển thị).

### Secret.events

Một mảng các chuỗi [Event.id](#event.id), chỉ định các job của event nào sẽ nhận secret dưới dạng các biến môi trường.

### Secret.categories

Một mảng các chuỗi [Category.id](#category.id), chỉ định các job của các event thuộc category nào sẽ nhận secret dưới dạng các biến môi trường.

### Secret.plugins

Một mảng các chuỗi [Plugin.id](#plugin.id), chỉ định các job của plugin nào sẽ nhận secret dưới dạng các biến môi trường.

### Secret.web_hooks

Một mảng các chuỗi [WebHook.id](#webhook-id), chỉ định web hook nào sẽ có quyền truy cập vào secret.

### Secret.notes

Các ghi chú hoặc nhận xét tùy chọn về secret (được lưu trữ dưới dạng văn bản thuần túy).

### Secret.username

Người dùng hoặc API Key đã tạo secret.

### Secret.modified

Timestamp Unix khi secret được sửa đổi lần cuối.

### Secret.created

Timestamp Unix khi secret được tạo.

### Secret.revision

Số bản sửa đổi nội bộ cho secret, được tăng lên với mỗi lần thay đổi.

## Server

Một server là một máy vật lý hoặc máy ảo kết nối với server conductor PTOps, cung cấp các số liệu để monitoring và có thể thực thi các job.  Đối tượng server đại diện cho một 인스턴스 (instance) server trong hệ sinh thái PTOps.  Dưới đây là một ví dụ về server ở định dạng JSON:

```json
{
	"autoGroup": true,
	"created": 1754365804,
	"enabled": true,
	"groups": [
		"main"
	],
	"hostname": "centos-9-arm",
	"id": "sorbstack01",
	"userData": {},
	"info": {
		"arch": "arm64",
		"booted": 1754854901.82,
		"cpu": {
			"brand": "",
			"cache": {
				"l1d": "",
				"l1i": "",
				"l2": "",
				"l3": ""
			},
			"combo": "Apple",
			"cores": 10,
			"efficiencyCores": 0,
			"family": "",
			"flags": "fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb dcpodp flagm2 frint",
			"governor": "performance",
			"manufacturer": "unknown",
			"model": "0",
			"performanceCores": 10,
			"physicalCores": 10,
			"processors": 1,
			"revision": "",
			"socket": "",
			"speed": 2,
			"speedMax": 2,
			"speedMin": 2,
			"stepping": "0x0",
			"vendor": "Apple",
			"virtualization": false,
			"voltage": ""
		},
		"memory": {
			"active": 651071488,
			"available": 16159313920,
			"buffcache": 199348224,
			"buffers": 28672,
			"cached": 131424256,
			"dirty": 0,
			"free": 16237981696,
			"slab": 67895296,
			"swapfree": 17884119040,
			"swaptotal": 17884119040,
			"swapused": 0,
			"total": 16810385408,
			"used": 572403712,
			"writeback": 0
		},
		"node": "18.14.2",
		"os": {
			"arch": "arm64",
			"build": "",
			"codename": "",
			"codepage": "UTF-8",
			"distro": "CentOS Stream",
			"fqdn": "centos-9-arm",
			"hostname": "centos-9-arm",
			"kernel": "6.14.10-orbstack-00291-g1b252bd3edea",
			"logofile": "centos",
			"platform": "Linux",
			"release": "9",
			"serial": "a7adc277eb8040f7a6f549c9261f9efe",
			"servicepack": "",
			"uefi": false
		},
		"platform": "linux",
		"release": "6.14.10-orbstack-00291-g1b252bd3edea",
		"satellite": "0.0.21",
		"virt": {
			"vendor": "OrbStack"
		}
	},
	"ip": "::ffff:10.1.10.241",
	"keywords": "centos-9-arm,::ffff:10,1,10,241,main,Linux,CentOS Stream,9,arm64,unknown,unknown,OrbStack,unknown,unknown,unknown",
	"modified": 1754872218,
	"socket_id": "wsme6crecj2o"
}
```

### Server.id

Một định danh chữ và số duy nhất cho server, được tự động gán ở lần tham gia đầu tiên.

### Server.hostname

Hostname của server, được sử dụng để hiển thị trên UI và có thể dùng để tự động gán vào các group.

### Server.ip

Địa chỉ IP của server (nếu server có nhiều interface mạng, đây là IP được sử dụng để kết nối tới server conductor).

### Server.title

Một tiêu đề tùy chọn do người dùng định nghĩa cho server, được sử dụng cho mục đích hiển thị trên UI.

### Server.icon

Một ID biểu tượng tùy chọn cho server, được hiển thị trên UI. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### Server.userData

Dữ liệu người dùng tùy chọn cho server (định dạng tự do), được truyền đến tất cả các job của server và có thể được sử dụng để nhắm mục tiêu event.

### Server.autoGroup

Một cờ boolean cho biết server có nên tự động được gán vào các group dựa trên hostname của nó hay không.

### Server.created

Timestamp Unix (tính bằng giây) khi server tham gia cụm lần đầu.

### Server.modified

Timestamp Unix (tính bằng giây) khi server được sửa đổi lần cuối.

### Server.groups

Một danh sách các group mà server là thành viên.

### Server.enabled

Một cờ boolean cho biết server có được bật hay không. Các server được bật sẽ được chọn để chạy job, các server bị vô hiệu hóa sẽ không.

### Server.maxJobs

Một giới hạn tùy chọn đặt trên server cho số job chạy đồng thời tối đa. Lưu ý rằng các job có thể có các trọng số khác nhau, được chỉ định trong giới hạn [Max Concurrent Jobs](limits.md#max-concurrent-jobs).

### Server.keywords

Một danh sách các từ khóa liên kết với server, được sử dụng để tìm kiếm và lọc.

### Server.socket_id

Định danh nội bộ cho kết nối socket của server.

### Server.info

Thông tin bổ sung về server, chẳng hạn như hệ điều hành, kiến trúc và các chi tiết liên quan khác, được sử dụng chủ yếu trong UI. Xem ví dụ JSON ở trên.

## Tag

Một tag là một nhãn do người dùng định nghĩa, có thể được gán cho các job nhằm mục đích tổ chức, phân loại và khả năng tìm kiếm. Dưới đây là một ví dụ tag theo định dạng JSON:

```json
{ 
	"id": "important", 
	"title": "Important", 
	"icon": "alert-rhombus", 
	"username": "admin", 
	"modified": 1611173740, 
	"created": 1611173740 
}
```

### Tag.id

Một định danh chữ và số duy nhất cho tag.

### Tag.title

Tiêu đề hiển thị cho tag.

### Tag.icon

Một ID biểu tượng tùy chọn cho tag, được hiển thị trên UI. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### Tag.notes

Các ghi chú hoặc bình luận tùy chọn về tag, dành cho nhu cầu sử dụng riêng của bạn.

### Tag.username

Tên đăng nhập của người dùng đã tạo tag.

### Tag.created

Timestamp Unix (tính bằng giây) khi tag được tạo.

### Tag.modified

Timestamp Unix (tính bằng giây) khi tag được sửa đổi lần cuối.

## Ticket

Một ticket có thể là một vấn đề, tính năng, thay đổi hoặc bản ghi khác để theo dõi các thay đổi hoặc sự cố. Xem [Tickets](tickets.md) để biết thêm chi tiết. Dưới đây là một ví dụ ticket theo định dạng JSON:

```json
{
	"subject": "Job #jmgn8f6ib7p failed with code: 1 (BlueSky Test)",
	"type": "issue",
	"status": "open",
	"category": "general",
	"assignees": [
		"admin"
	],
	"cc": [],
	"notify": [],
	"events": [
		{
			"id": "emgn8evze7b",
			"params": {},
			"targets": [],
			"algo": "",
			"tags": [
				"important"
			]
		}
	],
	"tags": [
		"flag"
	],
	"due": 0,
	"server": "",
	"id": "tmgpmoorz6p",
	"num": 24,
	"modified": 1760554137,
	"created": 1760389885,
	"changes": [
		{
			"type": "change",
			"username": "admin",
			"date": 1760389885,
			"key": "created"
		}
	],
	"username": "admin",
	"body": "The following PTOps job has failed with code: *1**\n\n- **Job ID:** `jmgn8f6ib7p`\n- **Error Code:** `1` -- Stripped remainder of body for brevity."
}
```

### Ticket.id

Một định danh chữ và số duy nhất cho ticket.

### Ticket.num

Một số ticket được tự động gán.

### Ticket.subject

Một tóm tắt ngắn về ticket.

### Ticket.body

Toàn bộ nội dung phần thân của ticket, ở định dạng nguồn Markdown.

### Ticket.type

Định danh loại ticket, nên là một trong các giá trị: `issue`, `feature`, `change`, `maintenance`, `question` hoặc `other`.

### Ticket.status

Định danh trạng thái ticket, nên là một trong các giá trị: `open`, `closed` hoặc `draft`.

### Ticket.category

Một [Category.id](#category-id) tùy chọn để liên kết với ticket.

### Ticket.server

Một [Server.id](#server-id) tùy chọn để liên kết với ticket.

### Ticket.assignees

Một mảng các [User.username](#user-username) chịu trách nhiệm về ticket (các bản cập nhật và nhắc nhở quá hạn được gửi cho họ).

### Ticket.cc

Một mảng các [User.username](#user-username) được Cc để nhận các bản cập nhật ticket qua email.

### Ticket.notify

Một mảng các địa chỉ email cũng sẽ nhận được các bản cập nhật ticket.

### Ticket.due

Một ngày đến hạn tùy chọn cho ticket, tính bằng giây Unix. Các lời nhắc hàng ngày sẽ được gửi đến tất cả những người được giao sau ngày này.

### Ticket.tags

Một mảng các [Tag.id](#tag-id) để liên kết với ticket.

### Ticket.events

Một mảng các đối tượng đại diện cho các [Event](#event) được đính kèm với ticket. Mỗi event có thể được tùy chỉnh để chạy các job từ ticket và chứa các thuộc tính sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | [Event.id](#event-id) của event. |
| `targets` | Array | Một mảng tùy chọn các mục tiêu (các [Group.id](#group-id) hoặc [Server.id](#server-id)) ghi đè các mặc định của event. |
| `algo` | String | Một thuật toán chọn server tùy chọn, ghi đè [Event.algo](#event-algo) mặc định từ event. |
| `tags` | Array | Một mảng tùy chọn các [Tag.id](#tag-id) để áp dụng cho các job chạy từ event của ticket, ghi đè các mặc định của event. |
| `params` | Object | Nếu event có các [Event.fields](#event-fields) được định nghĩa, đối tượng này sẽ ghi đè các giá trị mặc định và được gộp vào [Event.params](#event-params) khi các job chạy. |

### Ticket.files

Một mảng các đối tượng [File](#file) được tải lên cho ticket.

### Ticket.changes

Mảng này chứa danh sách tất cả các thay đổi được thực hiện đối với ticket, bao gồm những thứ như thay đổi trạng thái, người được giao và cả các bình luận được thêm vào. Mỗi phần tử trong mảng nên là một đối tượng với các thuộc tính sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `id` | String | Một ID chữ và số viết thường duy nhất cho thay đổi. |
| `type` | String | Loại thay đổi, nên là một trong các giá trị: `change` hoặc `comment`. |
| `username` | String | Tên đăng nhập của người dùng đã thực hiện thay đổi. |
| `date` | Number | Timestamp Unix của thay đổi. |
| `key` | String | Xác định thuộc tính ticket nào đã bị thay đổi, hoặc một trong hai giá trị đặc biệt: `created` (ticket được tạo) hoặc `delete` (bình luận đã bị xóa). |
| `value` | Mixed | Khi `key` xuất hiện, đây là giá trị mới mà thuộc tính đã được đổi thành. |
| `body` | String | Đối với các loại `comment`, đây là nội dung bình luận ở định dạng nguồn Markdown. |
| `edited` | Number | Khi các bình luận được chỉnh sửa, trường này xuất hiện và được đặt thành ngày sửa đổi lần cuối, tính bằng giây Unix. |

### Ticket.username

Tên đăng nhập của người dùng đã tạo ticket.

### Ticket.created

Timestamp Unix (tính bằng giây) khi ticket được tạo.

### Ticket.modified

Timestamp Unix (tính bằng giây) khi ticket được sửa đổi lần cuối.

## User

Một tài khoản người dùng là đại diện cho một người dùng cá nhân trong hệ thống. Đối tượng người dùng chứa các thông tin cơ bản về tài khoản người dùng, các vai trò và đặc quyền của họ, cũng như các tùy chọn giao diện người dùng của họ. Dưới đây là một ví dụ người dùng theo định dạng JSON:

```json
{
	"active": 1,
	"categories": [
		"came55y3uupq",
		"came65s9ttj4"
	],
	"color_acc": false,
	"contrast": "auto",
	"created": 1754798286,
	"effects": true,
	"email": "blob.schuurman@example.com",
	"full_name": "Blob Schuurman",
	"groups": [],
	"hour_cycle": "h12",
	"icon": "",
	"language": "",
	"modified": 1755396841,
	"motion": "auto",
	"num_format": "",
	"page_info": true,
	"password": "$2a$10$gB1MOjFZErSRJFI0nYtw/OH9DIJ1LAj6EsEIizSVfSkwclh7oKjJi",
	"privacy_mode": false,
	"privileges": {
		"create_events": 1,
		"edit_events": 1,
		"run_jobs": 1,
		"tag_jobs": 1
	},
	"region": "",
	"roles": [],
	"salt": "a9e7ee380e24485c26e98e8fe8887b9c572405c6b9932b2f93d6384e150dfb15",
	"searches": [
		{
			"icon": "timer-outline",
			"name": "All Completed",
			"loc": "Search"
		},
		{
			"icon": "check-circle-outline",
			"name": "Successes",
			"loc": "Search?result=success"
		},
		{
			"icon": "alert-decagram-outline",
			"name": "Errors",
			"loc": "Search?result=error"
		},
		{
			"icon": "alert-outline",
			"name": "Warnings",
			"loc": "Search?result=warning"
		},
		{
			"icon": "fire-alert",
			"name": "Criticals",
			"loc": "Search?result=critical"
		}
	],
	"sidebar": ["main", "job_searches", "ticket_searches", "shortcuts", "scheduler", "monitoring", "settings", "admin", "help"],
	"timezone": "",
	"username": "bluetiger469",
	"volume": 7
}
```

### User.username

Tên đăng nhập của người dùng. Các ký tự được phép là chữ và số, dấu gạch dưới, dấu chấm và dấu gạch ngang. Nếu tên đăng nhập được tạo tự động từ địa chỉ email (ví dụ: thông qua SSO), các ký tự nằm ngoài bộ hỗ trợ sẽ được chuyển đổi thành dấu gạch dưới.

### User.password

Mật khẩu đã được băm của người dùng, sử dụng [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) với muối (salt). Mật khẩu văn bản gốc của người dùng **không bao giờ** được lưu trữ.

### User.salt

Một giá trị muối (salt) duy nhất được sử dụng để băm mật khẩu của người dùng.

### User.full_name

Tên đầy đủ của người dùng, được sử dụng cho mục đích hiển thị.

### User.email

Địa chỉ email của người dùng.

### User.icon

Một ID biểu tượng tùy chọn cho người dùng, được hiển thị trên UI. Các biểu tượng được lấy từ [Material Design Icons](https://materialdesignicons.com/).

### User.active

Một cờ boolean cho biết tài khoản người dùng đang hoạt động hay bị vô hiệu hóa.

### User.created

Timestamp Unix (tính bằng giây) khi người dùng được tạo.

### User.modified

Timestamp Unix (tính bằng giây) khi người dùng được sửa đổi lần cuối.

### User.language

Ngôn ngữ (locale) ưa thích của người dùng, ví dụ: `en-US`. Nếu không được đặt, sẽ được trình duyệt tự động phát hiện.

### User.region

Khu vực địa lý của người dùng, ví dụ: `US`, `GB`, v.v. Nếu không được đặt, sẽ được trình duyệt tự động phát hiện.

### User.num_format

Hệ thống đánh số ưa thích của người dùng, ví dụ: `latn` (chữ số Latinh), v.v. Nếu không được đặt, sẽ được trình duyệt tự động phát hiện.

### User.hour_cycle

Chu kỳ giờ ưa thích của người dùng, ví dụ: `h12` (đồng hồ 12 giờ) hoặc `h24` (đồng hồ 24 giờ). Nếu không được đặt, sẽ được trình duyệt tự động phát hiện.

### User.timezone

Múi giờ ưa thích của người dùng, ví dụ: `America/New_York`. Nếu không được đặt, sẽ được trình duyệt tự động phát hiện.

### User.color_acc

Một boolean, cho biết người dùng sử dụng "chế độ trợ năng màu sắc". Tính năng này điều chỉnh màu sắc UI để dễ nhìn hơn.

### User.privacy_mode

Một boolean, cho biết người dùng sử dụng "chế độ riêng tư" (còn gọi là "chế độ streamer"). Tính năng này tự động làm mờ các thông tin nhạy cảm trên UI, bao gồm tên đăng nhập, tên đầy đủ, địa chỉ email, hostname của server, địa chỉ IP, API key và nhiều thông tin khác.

### User.effects
A boolean, indicating the user has enabled animated visual effects in the UI.

### User.page_info

Một boolean, cho biết user đã bật "mô tả trang" (page descriptions) trong UI. Điều này hiển thị một giải thích cho mỗi trang trong UI.

### User.contrast

Một chuỗi cho biết chế độ độ tương phản ưa thích của user. Các giá trị có thể là `auto`, `high`, `normal`, và `low`.

### User.motion

Một chuỗi cho biết cài đặt chuyển động ưa thích của user. Các giá trị có thể là `auto`, `full` và `reduced`.

### User.volume

Một số cho biết âm lượng ưa thích của user, từ 0 (tắt tiếng) đến 10 (lớn nhất).

### User.privileges

Một danh sách các đặc quyền được gán cho user. Mỗi đặc quyền được biểu diễn dưới dạng cặp key-value, trong đó key là tên đặc quyền và value không được sử dụng. Xem [Privileges](privileges.md) để biết thêm thông tin.

### User.roles

Một danh sách các vai trò được gán cho user. Xem [Role](#role).

### User.searches

Một danh sách các preset tìm kiếm cho user.

### User.sidebar

Một mảng gồm tất cả các phần sidebar để hiển thị trong UI cho user. Tập hợp đầy đủ mặc định là:

```json
["main", "job_searches", "ticket_searches", "shortcuts", "scheduler", "monitoring", "settings", "admin", "help"]
```

## WebHook

Web hook là một HTTP callback do user định nghĩa, được trigger bởi các action cụ thể trong PTOps. Khi action được chỉ định xảy ra, web hook gửi một HTTP request đến URL được chỉ định với một payload tùy chọn chứa thông tin về event. Các web hook thường được sử dụng cho các thông báo thời gian thực, tích hợp với các service khác, và tự động hóa workflow. Dưới đây là một ví dụ Web Hook ở định dạng JSON:

```json
{
	"id": "example_hook",
	"title": "Example Hook",
	"enabled": true,
	"url": "https://httpbin.org/post",
	"method": "POST",
	"headers": [
		{
			"name": "Content-Type",
			"value": "application/json"
		},
		{
			"name": "User-Agent",
			"value": "OpsRocket/WebHook"
		}
	],
	"body": "{\n\t\"text\": \"{{text}}\",\n\t\"content\": \"{{text}}\",\n\t\"message\": \"{{text}}\"\n}",
	"timeout": 30,
	"retries": 0,
	"follow": false,
	"ssl_cert_bypass": false,
	"notes": "An example web hook for demonstration purposes.",
	"icon": "",
	"username": "admin",
	"modified": 1754449105,
	"created": 1754365754,
	"revision": 2,
	"max_per_day": 0
}
```

### WebHook.id

Định danh duy nhất cho web hook.

### WebHook.title

Tiêu đề của web hook.

### WebHook.enabled

Một boolean cho biết web hook được bật hay tắt.

### WebHook.icon

Một icon ID tùy chọn cho web hook, được hiển thị trong UI. Các icon có nguồn từ [Material Design Icons](https://materialdesignicons.com/).

### WebHook.url

URL mà web hook sẽ gửi request đến.

### WebHook.method

Phương thức HTTP để sử dụng khi gửi request. Các phương thức phổ biến là `GET`, `POST`, `PUT`, và `DELETE`.

### WebHook.headers

Một danh sách tùy chọn các HTTP header để bao gồm trong request. Cái này được định dạng như một mảng các object, trong đó mỗi object có thuộc tính `name` và `value`.

### WebHook.body

Body tùy chọn của request để gửi cùng với web hook. Đây thường là một chuỗi JSON, và có thể bao gồm các placeholder (ví dụ: `{{text}}`) sẽ được thay thế bằng các giá trị thực tế khi web hook được trigger.

### WebHook.timeout

Thời gian tối đa để chờ phản hồi từ web hook trước khi timeout. Cái này được chỉ định bằng giây.

### WebHook.retries

Số lần retry web hook request nếu nó thất bại. Cái này được chỉ định dưới dạng số nguyên.

### WebHook.follow

Một boolean cho biết có theo dõi các redirect cho web hook request hay không.

### WebHook.ssl_cert_bypass

Một boolean cho biết có bỏ qua xác minh chứng chỉ SSL cho web hook request hay không.

### WebHook.max_per_day

Số lần tối đa web hook có thể được trigger trong một ngày (tức là chống spam). Cái này được chỉ định dưới dạng số nguyên.

### WebHook.notes

Một trường tùy chọn để thêm ghi chú hoặc comment về web hook.

### WebHook.revision

Một số revision nội bộ cho web hook, được sử dụng để theo dõi các thay đổi.

## Activity

Khi các action của user hoặc hệ thống được log lại, một mục activity sẽ được tạo và đánh chỉ mục trong DB để có thể tìm kiếm. Dưới đây là một ví dụ ở định dạng JSON:

```json
{
    "action": "ticket_create",
    "description": "tmg7023diyu",
    "epoch": 1759263488,
    "headers": {
        "user-agent": "Mozilla/5.0 (Macintosh; ... Safari/605.1.15"
    },
    "id": "amg7023dtyv",
    "ip": "127.0.0.1",
    "ips": [
        "127.0.0.1"
    ],
    "keywords": [
        "tmg7023diyu",
        "admin",
        "127.0.0.1"
    ],
    "ticket": {
        "assignee": "admin",
        "body": "This ticket was created to discuss job `#jmfftq09eqz` (**Monitored value-added protocol**).\n",
        "category": "cat1",
        "cc": [],
        "created": 1759263488,
        "due": 0,
        "events": [],
        "id": "tmg7023diyu",
        "modified": 1759263488,
        "notify": [],
        "num": 9,
        "status": "open",
        "subject": "Job #jmfftq09eqz succeeded (Monitored value-added protocol)",
        "tags": [
            "flag"
        ],
        "type": "issue",
        "username": "admin"
    },
    "username": "admin"
}
```

Mỗi loại activity (được biểu thị bằng thuộc tính `action`) có thể có các thuộc tính tùy chỉnh khác nhau. Tuy nhiên, xem bên dưới để biết các thuộc tính chung.

### Activity.id

Một ID chữ và số viết thường duy nhất được tự động gán khi activity được log.

### Activity.action

Một chuỗi xác định action đã diễn ra. Dưới đây là danh sách các action có thể có, cùng với một chuỗi template được sử dụng để tạo tóm tắt action trong UI:

| Action ID | Description / Template |
|-----------|------------------|
| `notice` | Thông báo chung, ví dụ: "Background server upgrade completed". |
| `warning` | Cảnh báo chung, ví dụ: "Server connecting with duplicate hostname...". |
| `error` | Lỗi chung (hiện không được sử dụng: dành cho tương lai). |
| `critical` | Nghiêm trọng chung, ví dụ: "Crash log found at startup". |
| `job_start` | Job đã bắt đầu (trước khi khởi chạy từ xa). |
| `job_complete` | Job đã hoàn thành, bất kể kết quả thế nào. |
| `job_success` | Job đã hoàn thành thành công (`code` là `0` hoặc `false`). |
| `job_error` | Job đã hoàn thành với bất kỳ lỗi nào (`code` khác không/khác false). |
| `job_warning` | Job đã hoàn thành với `code` được đặt thành `warning`. |
| `job_critical` | Job đã hoàn thành với `code` được đặt thành `critical`. |
| `job_abort` | Job đã bị hủy (do user hoặc điều kiện thất bại). |
| `job_tag:TAGID` | Job đã hoàn thành và có tag được chỉ định. |
| `alert_new` | Alert đã kích hoạt trên một server. |
| `alert_cleared` | Alert đã được xóa trên một server. |
| `alert_create` | `Định nghĩa alert đã được tạo: [description] ([alert.id])` |
| `alert_update` | `Định nghĩa alert đã được cập nhật: [description] ([alert.id])` |
| `alert_delete` | `Định nghĩa alert đã bị xóa: [description] ([alert.id])` |
| `alert_update_tickets` | `Các ticket của alert invocation đã được cập nhật: #[description]` |
| `alert_delete_invocation` | `Alert invocation đã bị xóa: #[description]` |
| `apikey_create` | `API Key đã được tạo: [description]` |
| `apikey_update` | `API Key đã được cập nhật: [description]` |
| `apikey_delete` | `API Key đã bị xóa: [description]` |
| `category_create` | `Category đã được tạo: [description] ([category.id])` |
| `category_update` | `Category đã được cập nhật: [description] ([category.id])` |
| `category_delete` | `Category đã bị xóa: [description] ([category.id])` |
| `category_multi_update` | `Nhiều category đã được cập nhật ([updated]).` |
| `channel_create` | `Channel đã được tạo: [description] ([channel.id])` |
| `channel_update` | `Channel đã được cập nhật: [description] ([channel.id])` |
| `channel_delete` | `Channel đã bị xóa: [description] ([channel.id])` |
| `event_create` | `Event đã được tạo: [description] ([event.id])` |
| `event_update` | `Event đã được cập nhật: [description] ([event.id])` |
| `event_delete` | `Event đã bị xóa: [description] ([event.id])` |
| `job_update` | `Job đã được cập nhật: #[description]` |
| `job_update_tags` | `Các tag của job đã được cập nhật: #[description]` |
| `job_update_tickets` | `Các ticket của job đã được cập nhật: #[description]` |
| `job_update_comments` | `Các comment của job đã được cập nhật: #[description]` |
| `job_abort` | `Job đã bị hủy: #[description]: [reason]` |
| `job_delete` | `Job đã bị xóa: #[description]` |
| `job_delete_file` | `File của job đã bị xóa: #[description]: [path]` |
| `job_resume` | `Job đã được tiếp tục: #[description]` |
| `queue_flush` | `Đã dọn dẹp hàng đợi job cho event: #[description]` |
| `group_create` | `Group server đã được tạo: [description] ([group.id])` |
| `group_update` | `Group server đã được cập nhật: [description] ([group.id])` |
| `group_delete` | `Group server đã bị xóa: [description] ([group.id])` |
| `group_multi_update` | `Nhiều group server đã được cập nhật ([updated]).` |
| `group_watch` | `Một theo dõi trong [duration] đã được đặt trên group: [group.title] ([group.id])` |
| `monitor_create` | `Monitor đã được tạo: [description] ([monitor.id])` |
| `monitor_update` | `Monitor đã được cập nhật: [description] ([monitor.id])` |
| `monitor_delete` | `Monitor đã bị xóa: [description] ([monitor.id])` |
| `monitor_multi_update` | `Nhiều monitor đã được cập nhật ([updated]).` |
| `plugin_create` | `Plugin đã được tạo: [description] ([plugin.id])` |
| `plugin_update` | `Plugin đã được cập nhật: [description] ([plugin.id])` |
| `plugin_delete` | `Plugin đã bị xóa: [description] ([plugin.id])` |
| `tag_create` | `Tag đã được tạo: [description] ([tag.id])` |
| `tag_update` | `Tag đã được cập nhật: [description] ([tag.id])` |
| `tag_delete` | `Tag đã bị xóa: [description] ([tag.id])` |
| `web_hook_create` | `Web Hook đã được tạo: [description] ([web_hook.id])` |
| `web_hook_update` | `Web Hook đã được cập nhật: [description] ([web_hook.id])` |
| `web_hook_delete` | `Web Hook đã bị xóa: [description] ([web_hook.id])` |
| `bucket_create` | `Bucket đã được tạo: [description] ([bucket.id])` |
| `bucket_update` | `Bucket đã được cập nhật: [description] ([bucket.id])` |
| `bucket_delete` | `Bucket đã bị xóa: [description] ([bucket.id])` |
| `secret_create` | `Secret đã được tạo: [description] ([secret.id])` |
| `secret_update` | `Secret đã được cập nhật: [description] ([secret.id])` |
| `secret_delete` | `Secret đã bị xóa: [description] ([secret.id])` |
| `secret_access` | `Secret đã được truy cập: [description] ([secret.id])` |
| `ticket_create` | `Ticket #[ticket.num] đã được tạo: [ticket.subject] ([ticket.id])` |
| `ticket_update` | `Ticket #[ticket.num] đã được cập nhật: [ticket.subject] ([ticket.id])` |
| `ticket_delete` | `Ticket #[ticket.num] đã bị xóa: [ticket.subject] ([ticket.id])` |
| `ticket_add_change` | `Comment của ticket đã được thêm: #[ticket.num]: [ticket.subject] ([ticket.id])` |
| `ticket_update_change` | `Comment của ticket đã được cập nhật: #[ticket.num]: [ticket.subject] ([ticket.id])` |
| `user_create` | `User đã được tạo: [user.full_name] ([user.username])` |
| `user_update` | `User đã được cập nhật: [user.full_name] ([user.username])` |
| `user_delete` | `User đã bị xóa: [user.full_name] ([user.username])` |
| `user_login` | `User đã đăng nhập: [user.full_name] ([user.username])` |
| `user_password` | `Mật khẩu user đã được thay đổi: [user.full_name] ([user.username])` |
| `role_create` | `Vai trò đã được tạo: [description] ([role.id])` |
| `role_update` | `Vai trò đã được cập nhật: [description] ([role.id])` |
| `role_delete` | `Vai trò đã bị xóa: [description] ([role.id])` |
| `server_add` | `Server đã kết nối vào mạng: [hostname]` |
| `server_remove` | `Server đã ngắt kết nối khỏi mạng: [hostname]` |
| `server_delete` | `Server đã bị xóa: [hostname]` |
| `server_update` | `Thông tin server đã được cập nhật: [hostname]` |
| `server_watch` | `Một theo dõi trong [duration] đã được đặt trên server: [hostname]` |
| `master_primary` | `Server conductor hiện là primary: [host]` |
| `peer_add` | `Server conductor đã được thêm vào mạng: [host]` |
| `peer_disconnect` | `Server conductor đã ngắt kết nối khỏi mạng: [host]` |
| `peer_command` | `Lệnh điều khiển [commands] đã được gửi tới server conductor: [host]` |
| `state_update` | `Trạng thái nội bộ đã được cập nhật: [description]` |
| `internal_job` | `Job nội bộ đã hoàn thành: [job.title]` |

### Activity.description

Một "mô tả" ngắn về action, thường là một ID mục cụ thể.

### Activity.epoch

Ngày/giờ khi activity diễn ra, được biểu diễn bằng giây Unix.

### Activity.headers

Nếu activity được bắt đầu bởi một HTTP request, điều này chứa các request header đến (không có cookie).

### Activity.ip

Nếu activity được bắt đầu bởi một HTTP request, điều này chứa địa chỉ IP chính của client.

### Activity.ips

Nếu activity được bắt đầu bởi một HTTP request, điều này chứa tất cả các địa chỉ IP (bao gồm cả các proxy).

### Activity.keywords

Một mảng các keyword được sử dụng để tìm kiếm activity trong UI.

### Activity.username

Nếu activity được bắt đầu bởi một user, điều này chứa username (hoặc API Key ID).

## AlertInvocation

Alert invocation là một instance cụ thể của một alert đang được trigger. Nó chứa thông tin về alert, server áp dụng, và context trong đó nó được trigger. Dưới đây là một ví dụ alert invocation ở định dạng JSON:

```json
{
    "active": false,
    "alert": "active_jobs_high",
    "count": 1,
    "date": 1754450881,
    "exp": "monitors.active_jobs >= 1",
    "groups": [
        "main"
    ],
    "id": "amdzer7xtk3",
    "jobs": [
        "jmdzer6zrju"
    ],
    "message": "Active job count is too high: 1",
    "modified": 1754450941,
    "notified": true,
    "server": "sorbstack01"
}
```

### AlertInvocation.id

Định danh duy nhất cho alert invocation.

### AlertInvocation.active

Một boolean cho biết alert invocation đang hoạt động (`true`) hay đã được xóa (`false`).

### AlertInvocation.alert

[Alert.id](#alert-id) của alert đã trigger invocation.

### AlertInvocation.count

Một bộ đếm nội bộ được sử dụng để theo dõi số lượng mẫu alert (warm-up và cool-down).

### AlertInvocation.date

Timestamp Unix epoch của thời điểm alert được trigger.

### AlertInvocation.exp

Biểu thức đã trigger alert.

### AlertInvocation.groups

Các group mà server đã trigger alert thuộc về.

### AlertInvocation.jobs

Các job đang chạy trên server tại thời điểm alert invocation.

### AlertInvocation.message

Message liên kết với alert invocation.

### AlertInvocation.modified

Timestamp Unix epoch của thời điểm alert invocation được sửa đổi lần cuối.

### AlertInvocation.notified

Một boolean nội bộ cho biết alert đã được thông báo hay chưa.

### AlertInvocation.server

[Server.id](#server-id) mà alert được liên kết với.

### AlertInvocation.tickets

Một mảng các [Ticket.id](#ticket-id) tham chiếu đến alert invocation.

## ServerMonitorData

Dữ liệu theo dõi server (Server monitoring data) được thu thập mỗi phút trên mỗi server, và là nguồn cho tất cả các monitor và alert. Nó là một cấu trúc dài dòng, được chia thành các thuộc tính top-level sau.

### ServerMonitorData.arch

Kiến trúc của server (ví dụ: `x86_64`, `arm64`).

### ServerMonitorData.commands

Đầu ra thô hiện tại từ tất cả các lệnh tùy chỉnh của user (hay còn gọi là Monitor Plugins), được đánh key bởi [Plugin.id](#plugin-id). Ví dụ:

```json
{
	"open_files": "1056\t0\t9223372036854775807"
}
```

### ServerMonitorData.conns

Một mảng các kết nối mạng hiện tại trên server, bao gồm địa chỉ IP nguồn và đích, các cổng, và các trạng thái kết nối. Bao gồm các socket listener. Dưới đây là một ví dụ kết nối:

```json
{
	"bytes_in": 12075,
	"bytes_out": 3718412,
	"local_addr": "198.19.249.106:47968",
	"pid": 17430,
	"remote_addr": "10.1.10.241:5522",
	"state": "ESTABLISHED",
	"type": "tcp"
}
```

### ServerMonitorData.cpu

Số liệu thống kê và thông tin sử dụng CPU hiện tại cho server, bao gồm thời gian của user, system, và idle, cũng như thông tin về phần cứng CPU và ảo hóa. Dưới đây là một ví dụ object `cpu`:

```json
{
	"avgLoad": 0,
	"brand": "",
	"cache": {
		"l1d": "",
		"l1i": "",
		"l2": "",
		"l3": ""
	},
	"combo": "Apple",
	"cores": 2,
	"cpus": [
		{
			"active": 0.21999999999999886,
			"idle": 99.78,
			"iowait": 0,
			"irq": 0,
			"nice": 0,
			"softirq": 0.01,
			"system": 0.06,
			"user": 0.13
		},
		{
			"active": 0.3199999999999932,
			"idle": 99.68,
			"iowait": 0,
			"irq": 0,
			"nice": 0,
			"softirq": 0,
			"system": 0.15,
			"user": 0.16
		}
	],
	"currentLoad": 0.14000000000000057,
	"efficiencyCores": 0,
	"family": "",
	"flags": "fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm jscvt fcma lrcpc dcpop sha3 asimddp sha512 asimdfhm dit uscat ilrcpc flagm sb dcpodp flagm2 frint",
	"governor": "performance",
	"manufacturer": "unknown",
	"model": "0",
	"performanceCores": 10,
	"physicalCores": 10,
	"processors": 1,
	"revision": "",
	"socket": "",
	"speed": 2,
	"speedMax": 2,
	"speedMin": 2,
	"stepping": "0x0",
	"totals": {
		"active": 0.14000000000000057,
		"idle": 99.86,
		"iowait": 0,
		"irq": 0,
		"nice": 0,
		"softirq": 0,
		"system": 0.05,
		"user": 0.08
	},
	"vendor": "Apple",
	"virtualization": false,
	"voltage": ""
}
```

### ServerMonitorData.deltas

Thông tin delta cho các monitor theo dõi thay đổi theo thời gian. Đối tượng này được lập khóa bằng [Monitor.id](#monitor-id) và giá trị là delta hiện tại giữa các mẫu hiện tại và trước đó. Ví dụ:

```json
{
	"disk_iops_sec": 11,
	"disk_read_sec": 791620,
	"disk_write_sec": 0,
	"os_bytes_in_sec": 86,
	"os_bytes_out_sec": 2179
}
```

### ServerMonitorData.interfaces

Một đối tượng chứa thông tin về các giao diện mạng trên server, bao gồm tên của chúng, địa chỉ IP và các chi tiết liên quan khác. Các thuộc tính của đối tượng là tên giao diện, ví dụ: `eth0` và giá trị là một đối tượng mô tả giao diện. Dưới đây là một ví dụ:

```json
{
	"eth0": {
		"carrierChanges": 4,
		"default": true,
		"dhcp": true,
		"dnsSuffix": "Not defined",
		"duplex": "full",
		"ieee8021xAuth": "Not defined",
		"ieee8021xState": "Disabled",
		"iface": "eth0",
		"ifaceName": "eth0",
		"internal": false,
		"ip4": "198.19.249.106",
		"ip4subnet": "255.255.255.0",
		"ip6": "fd07:b51a:cc66:0:dc08:f5e7:80f8:da07",
		"ip6subnet": "ffff:ffff:ffff:ffff::",
		"mac": "00:00:00:00:00:00",
		"ms": 59964,
		"mtu": 1500,
		"operstate": "up",
		"rx_bytes": 724721,
		"rx_dropped": 0,
		"rx_errors": 0,
		"rx_sec": 86.45187112267361,
		"speed": 10000,
		"tx_bytes": 15102620,
		"tx_dropped": 0,
		"tx_errors": 0,
		"tx_sec": 2181.2254019078114,
		"type": "wired",
		"virtual": false
	}
}
```

### ServerMonitorData.jobs

Số lượng các job đang chạy trên server.

### ServerMonitorData.load

Ba chỉ số tải CPU trung bình dưới dạng một mảng, được đo trong khoảng thời gian 1, 5 và 15 phút. Ví dụ:

```json
[
	0,
	0.04,
	0.08
]
```

### ServerMonitorData.memory

Thông tin về mức sử dụng bộ nhớ hiện tại của server, bao gồm bộ nhớ tổng, đã sử dụng và trống, cũng như một loạt các chỉ số khác. Dưới đây là một ví dụ:

```json
{
	"active": 246853632,
	"anonhugepages": 0,
	"anonpages": 210190336,
	"available": 16181153792,
	"bounce": 0,
	"buffers": 12288,
	"cached": 69079040,
	"commitlimit": 26289311744,
	"committed_as": 1104420864,
	"dirty": 0,
	"filehugepages": 0,
	"filepmdmapped": 0,
	"free": 16290963456,
	"inactive": 38060032,
	"kernelstack": 5373952,
	"kreclaimable": 18268160,
	"mapped": 18681856,
	"mlocked": 0,
	"nfs_unstable": 0,
	"pagetables": 12222464,
	"percpu": 3686400,
	"secpagetables": 0,
	"shmem": 32534528,
	"shmemhugepages": 0,
	"shmempmdmapped": 0,
	"slab": 68550656,
	"sreclaimable": 18268160,
	"sunreclaim": 50282496,
	"swapcached": 0,
	"swapfree": 17884119040,
	"swaptotal": 17884119040,
	"total": 16810385408,
	"unevictable": 0,
	"used": 629231616,
	"vmallocchunk": 0,
	"vmalloctotal": 138535235485696,
	"vmallocused": 85164032,
	"writeback": 0,
	"writebacktmp": 0
}
```

### ServerMonitorData.monitors

Các giá trị được tính toán hiện tại của tất cả các monitor trên server. Đây là tất cả các monitor do người dùng xác định theo dõi một giá trị duy nhất theo thời gian, nhằm mục đích vẽ biểu đồ (và thường là cảnh báo alert). Ví dụ:

```json
{
	"active_jobs": 0,
	"cpu_usage": 0.14,
	"disk_iops_sec": 75866,
	"disk_read_sec": 4345634816,
	"disk_usage_root": 5.09999,
	"disk_write_sec": 54124544,
	"io_wait": 0,
	"load_avg": 0,
	"mem_free": 16181153792,
	"mem_used": 629231616,
	"mmdze1gznbt": 42438656,
	"net_conns": 4,
	"open_files": 1056,
	"os_bytes_in_sec": 724721,
	"os_bytes_out_sec": 15102620,
	"total_procs": 23
}
```

### ServerMonitorData.mounts

Thông tin về các hệ thống tập tin được mount trên server. Dưới đây là một ví dụ:

```json
{
	"mnt_mac": {
		"available": 453466611712,
		"fs": "mac",
		"mount": "/mnt/mac",
		"rw": false,
		"size": 994662584320,
		"type": "virtiofs",
		"use": 54.41,
		"used": 541195972608
	},
	"opt_orbstack_guest": {
		"available": 8404656128,
		"fs": "orbstack",
		"mount": "/opt/orbstack-guest",
		"rw": false,
		"size": 8405192704,
		"type": "overlay",
		"use": 0.01,
		"used": 536576
	},
	"root": {
		"available": 430730186752,
		"fs": "/dev/vdb1",
		"mount": "/",
		"rw": true,
		"size": 453868638208,
		"type": "btrfs",
		"use": 5.1,
		"used": 23138451456
	}
}
```

### ServerMonitorData.os

Thông tin chi tiết về hệ điều hành đang chạy trên server. Dưới đây là một ví dụ:

```json
{
	"arch": "arm64",
	"build": "",
	"codename": "",
	"codepage": "UTF-8",
	"distro": "CentOS Stream",
	"fqdn": "centos-9-arm",
	"hostname": "centos-9-arm",
	"kernel": "6.14.10-orbstack-00291-g1b252bd3edea",
	"logofile": "centos",
	"platform": "Linux",
	"release": "9",
	"serial": "a7adc277eb8040f7a6f549c9261f9efe",
	"servicepack": "",
	"uefi": false
}
```

### ServerMonitorData.platform

Nền tảng của server, theo báo cáo của hàm Node.js [os.platform()](https://nodejs.org/api/os.html#osplatform). Các giá trị có thể có là `aix`, `darwin`, `freebsd`, `linux`, `openbsd`, `sunos` và `win32`.

### ServerMonitorData.process

Thông tin về chính tiến trình PTOps Satellite. Ví dụ:

```json
{
	"pid": 3434,
	"cpu": 0.9638568333333333,
	"mem": 42184704,
	"started": 1754870793
}
```

### ServerMonitorData.processes

Thông tin chi tiết về tất cả các tiến trình đang chạy trên server. Trước tiên, đây là cấu trúc của đối tượng `processes`, chứa một số bộ đếm trạng thái tiến trình, cũng như một mảng `list`:

```json
{
	"all": 23,
	"list": [...],
	"running": 1,
	"sleeping": 22
}
```

Và đây là một tiến trình ví dụ, sẽ là một phần tử bên trong mảng `list`:

```json
{
	"age": 17294,
	"class": "Other",
	"command": "/usr/bin/redis-server *:6379",
	"cpu": 0.02,
	"group": "redis",
	"mem": 0,
	"memRss": 3227648,
	"memVsz": 1122566144,
	"nice": 0,
	"parentPid": 1,
	"pid": 272,
	"priority": 19,
	"started": 1754854907,
	"state": "Sleeping",
	"threads": 5,
	"time": 42,
	"tty": "?",
	"user": "redis"
}
```

### ServerMonitorData.release

Tên hệ điều hành, theo báo cáo của hàm Node.js [os.release()](https://nodejs.org/api/os.html#osrelease). Ví dụ: `6.12.34+rpt-rpi-v8`.

### ServerMonitorData.stats

Chứa thông tin về hệ thống tập tin, I/O và thông lượng mạng. Xem chi tiết bên dưới.

### ServerMonitorData.stats.fs

Chứa thông tin về thông lượng hệ thống tập tin trên server. Ví dụ:

```json
{
	"ms": 59984,
	"rx": 4345634816,
	"rx_sec": 791831.4217124566,
	"tx": 4399759360,
	"tx_sec": 791831.4217124566,
	"wx": 54124544,
	"wx_sec": 0
}
```

### ServerMonitorData.stats.io

Chứa thông tin về thông lượng I/O chung trên server. Ví dụ:

```json
{
	"ms": 59985,
	"rIO": 71062,
	"rIO_sec": 11.186129865799783,
	"rWaitPercent": 0.0033341668750520963,
	"rWaitTime": 420,
	"tIO": 75866,
	"tIO_sec": 11.186129865799783,
	"tWaitPercent": 0.0033341668750520963,
	"tWaitTime": 4807,
	"wIO": 4804,
	"wIO_sec": 0,
	"wWaitPercent": 0,
	"wWaitTime": 2039
}
```

### ServerMonitorData.stats.network

Chứa thông tin về thông lượng mạng hiện hành trên server. Ví dụ:

```json
{
	"conns": 4,
	"ifaces": [
		"eth0"
	],
	"rx_bytes": 724721,
	"rx_dropped": 0,
	"rx_errors": 0,
	"rx_sec": 86.45187112267361,
	"states": {
		"established": 1,
		"listen": 2,
		"unconnected": 1
	},
	"tx_bytes": 15102620,
	"tx_dropped": 0,
	"tx_errors": 0,
	"tx_sec": 2181.2254019078114
}
```

### ServerMonitorData.stats.uptime_sec

Thời gian hoạt động (uptime) của server tính bằng giây.

## Snapshot

Một snapshot là bản ghi mọi thứ đang diễn ra trên một server trong một thời điểm cụ thể, bao gồm tất cả dữ liệu giám sát, tiến trình, kết nối mạng và nhiều thứ khác. Xem [Snapshots](snapshots.md) để biết thêm chi tiết. Dưới đây là một snapshot ví dụ ở định dạng JSON, với các phần lớn hơn được bỏ qua cho ngắn gọn:

```json
{
    "alerts": [],
    "data": {},
    "date": 1754793721,
    "groups": [
        "main"
    ],
    "hostname": "centos-9-arm",
    "id": "snme52vvah17",
    "ip": "::ffff:10.1.10.241",
    "jobs": [],
    "quickmon": [],
    "server": "sorbstack01",
    "source": "user",
    "type": "server",
    "username": "admin",
    "version": "1.0"
}
```

### Snapshot.id

Một ID chữ và số in thường duy nhất được tạo tự động cho snapshot.

### Snapshot.type

Loại snapshot, sẽ là `server` đối với một server đơn, hoặc `group` cho một snapshot nhóm nhiều server.

### Snapshot.server

[Server.id](#server-id) của server mà từ đó snapshot được tạo ra.

### Snapshot.version

Phiên bản định dạng dữ liệu của snapshot.

### Snapshot.date

Ngày/giờ mà snapshot được chụp, tính bằng giây Unix.

### Snapshot.groups

Một mảng các [Group.id](#group-id) mà server thuộc về.

### Snapshot.hostname

Hostname của server đã tạo ra snapshot.

### Snapshot.ip

Địa chỉ IP của server đã tạo ra snapshot.

### Snapshot.source

Một chuỗi biểu thị cách thức snapshot được chụp, sẽ là một trong các giá trị sau: `alert`, `watch`, `user` hoặc `job`.

### Snapshot.username

Nếu [Snapshot.source](#snapshot-source) là `user`, đây là [User.username](#user-username) của người dùng đã thực hiện chụp.

### Snapshot.quickmon

Một mảng các mẫu [QuickmonData](#quickmondata) cho server, đại diện cho 60 giây cuối cùng trước khi snapshot được chụp.

### Snapshot.jobs

Một mảng các [Job.id](#job-id) đại diện cho các job đang hoạt động trên server tại thời điểm thực hiện snapshot.

### Snapshot.alerts

Một mảng các [AlertInvocation.id](#alertinvocation-id) đại diện cho các alert đang hoạt động trên server tại thời điểm snapshot.

### Snapshot.data

Một bản sao của [ServerMonitorData](#servermonitordata) cho server được chụp tại thời điểm snapshot.

## GroupSnapshot

Các snapshot có thể được chụp cho toàn bộ các group server, sử dụng cấu trúc sau để lưu trữ dữ liệu.

### GroupSnapshot.id

Một ID chữ và số viết thường duy nhất được tạo tự động cho snapshot.

### GroupSnapshot.type

Loại snapshot, trong trường hợp này sẽ được đặt là `group`.

### GroupSnapshot.date

Ngày/giờ khi snapshot được chụp, tính bằng giây Unix.

### GroupSnapshot.groups

Sẽ là một mảng có đúng một phần tử, [Group.id](#group-id) cho group.

### GroupSnapshot.group_def

Một bản sao của đối tượng [Group](#group) cho group, được chụp tại thời điểm snapshot.

### GroupSnapshot.servers

Một mảng các đối tượng [Server](#server) cho group.

### GroupSnapshot.snapshots

Một mảng các [ServerMonitorData](#servermonitordata) cho group, với các chỉ số tương ứng với [GroupSnapshot.servers](#groupsnapshot-servers).

### GroupSnapshot.alerts

Một mảng các [AlertInvocation.id](#alertinvocation-id) đại diện cho các alert đang hoạt động trong group tại thời điểm snapshot.

### GroupSnapshot.jobs

Một mảng các [Job.id](#job-id) đại diện cho các job đang hoạt động trong group tại thời điểm snapshot.

### GroupSnapshot.quickmons

Một mảng các mẫu [QuickmonData](#quickmondata) cho group, với các chỉ số tương ứng với [GroupSnapshot.servers](#groupsnapshot-servers).

## Conductor

PTOps theo dõi tất cả các server conductor (sao lưu) đang trực tuyến trong cụm, sử dụng cấu trúc dữ liệu trong bộ nhớ sau (hiển thị dưới dạng JSON):

```json
{
	"id": "joemax.lan",
	"online": true,
	"master": true,
	"date": 1762816958,
	"version": "1.0",
	"ping": 0,
	"stats": { 
		"mem": 134217728, 
		"load": 0.02
	}
}
```

### Conductor.id

Đây là ID nội bộ của server conductor, thường là hostname của nó.

### Conductor.online

Một boolean cho biết server có đang trực tuyến (đã kết nối) hay không.

### Conductor.master

Một boolean cho biết conductor có phải là conductor chính hiện tại hay không.

### Conductor.date

Một dấu thời gian tính bằng giây Unix đại diện cho thời điểm server lên mạng.

### Conductor.version

Hiện tại không được sử dụng, sẽ luôn được đặt là "1.0". Dành cho mục đích sử dụng trong tương lai.

### Conductor.ping

Thời gian ping gần nhất (tính bằng mili giây) giữa conductor hiện tại và server (Websocket RTT).

### Conductor.stats

Đối tượng này sẽ chứa các số liệu thống kê cơ bản về server, bao gồm `mem` (việc sử dụng bộ nhớ hiện tại của tiến trình PTOps) và `load` (trung bình tải theo phút).

## State

PTOps giữ dữ liệu trạng thái trong một bản ghi lưu trữ `global/state`. Điều này là để nó có thể tồn tại sau khi khởi động lại, và tồn tại sau khi chuyển đổi dự phòng conductor sang một server dự phòng. Nó được sử dụng để lưu trữ những thứ như bộ chuyển đổi lịch trình, trạng thái event (con trỏ thời gian) và theo dõi server/group (các snapshot).

### State.scheduler

Đối tượng `scheduler` chứa các thuộc tính cụ thể cho hệ thống con lập lịch job. Cụ thể là một boolean `enabled`, sẽ là `true` nếu bộ lập lịch đang hoạt động và chạy các job, hoặc `false` nếu nó bị tạm dừng.

### State.events

Đối tượng `events` giữ thông tin trạng thái về tất cả các event, cụ thể là con trỏ của chúng cho chế độ [Catch-Up](triggers.md#catch-up) và thông tin về các job đã hoàn thành trước đó. Đây là các thuộc tính được lưu trữ cho mỗi event, mỗi thuộc tính nằm trong `events.EVENTID.`:

| Property Name | Type | Description |
|---------------|------|-------------|
| `cursor` | Number | Đối với các event [Catch-Up](triggers.md#catch-up), thuộc tính này chứa dấu thời gian hiện tại của event, được sử dụng để chạy tất cả các job bị nhỡ trong một khoảng thời gian ngừng hoạt động. |
| `last_code` | Mixed | [Job.code](#job-code) từ job hoàn thành gần nhất, nếu có. |
| `last_job` | String | [Job.id](#job-id) của job hoàn thành gần nhất, nếu có. |
| `total_elapsed` | Number | Tổng thời gian trôi qua của job trên tất cả các job đã hoàn thành (được sử dụng để tính trung bình). |
| `total_count` | Number | Tổng số job đã hoàn thành được ghi nhận. `total_elapsed` được chia cho con số này để có thời gian job trôi qua trung bình cho event. |

### State.watches

PTOps theo dõi các phiên theo dõi server và group (các snapshot theo dõi tự động) trong đối tượng này. Bố cục dữ liệu như sau:

- Các phiên theo dõi server được lưu trong `watches.servers.SERVERID`.
- Các phiên theo dõi group được lưu trong `watches.groups.GROUPID`.

Các giá trị thuộc tính là giây Unix, được đặt thành thời điểm phiên theo dõi sẽ kết thúc. Ví dụ ở định dạng JSON:

```json
{
	"watches": {
		"servers": {
			"smgqzr4dtgw": 1762050600,
			"jmgs89hkdrv": 1962050600
		},
		"groups": {
			"gmhl194nsw8": 1862050600
		}
	}
}
```

### State.next_ticket_num

Thuộc tính này giữ [Ticket.num](#ticket-num) khả dụng tiếp theo, được áp dụng và tăng lên khi một ticket mới được tạo.

## Sub-Objects

Các đối tượng này được lồng dưới các cấu trúc dữ liệu khác, thường là các mục của một mảng.

### Action

Các action có thể được gán cho các event liên quan đến job và alert chẳng hạn như job bắt đầu, job hoàn thành, các lỗi job, alert mới và các điều kiện khác. Đây là một ví dụ:

```json
{
	"enabled": true,
	"condition": "error",
	"type": "email",
	"email": "admin@myserver.com"
}
```

action này sẽ kích hoạt khi job dẫn đến lỗi và nó sẽ gửi một email tới `admin@myserver.com`, thông báo cho họ về event.

Mỗi đối tượng action phải có các thuộc tính sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `enabled` | Boolean | Chỉ định xem action được bật (`true`) hay bị tắt (`false`). |
| `condition` | String | Chỉ định điều kiện sẽ chạy action. Xem [Action.conditions](#action-condition) bên dưới. |
| `type` | String | Chỉ định action nào sẽ diễn ra khi điều kiện kích hoạt. Xem [Action.type](#action-type) bên dưới. |

Các thuộc tính bổ sung có thể có mặt tùy thuộc vào loại.

#### Action.condition

Mỗi action có một thuộc tính `condition` chỉ định khi nào nó sẽ kích hoạt. Giá trị có thể là một trong:

| Condition ID | Description |
|------------|-------------|
| `start` | Kích hoạt khi job bắt đầu. |
| `complete` | Kích hoạt khi job hoàn thành, bất kể kết quả. |
| `success` | Kích hoạt khi job thành công, tức là khi thuộc tính `code` là `0` hoặc `false`. |
| `error` | Kích hoạt khi có lỗi job, tức là khi thuộc tính `code` là bất kỳ giá trị đúng hoặc chuỗi nào. |
| `warning` | Kích hoạt khi có cảnh báo job, tức là khi thuộc tính `code` được đặt là `"warning"`. |
| `critical` | Kích hoạt khi có lỗi nghiêm trọng, tức là khi thuộc tính `code` được đặt là `"critical"`. |
| `abort` | Kích hoạt khi job bị hủy, do người dùng hoặc event đặc biệt (ví dụ: mất server). |
| `tag:TAGID` | Chỉ kích hoạt khi job hoàn thành khi có một tag cụ thể trên job. |
| `alert_new` | Kích hoạt khi một alert mới được kích hoạt trên một server. |
| `alert_cleared` | Kích hoạt khi một alert đang hoạt động đã được xóa. |

#### Action.type

Mỗi action có một thuộc tính `type` ra lệnh cho những gì sẽ xảy ra khi điều kiện kích hoạt. Các loại khác nhau được liệt kê bên dưới:

| Type ID | Description |
|---------|-------------|
| `email` | Gửi email đến một hoặc nhiều địa chỉ. Các địa chỉ phải nằm trong một thuộc tính bổ sung có tên `email` (được phân tách bằng dấu phẩy). |
| `web_hook` | Kích hoạt một web hook (HTTP POST) cho action. URL phải được chỉ định trong một thuộc tính có tên `url`. |
| `run_event` | Chạy một job tùy chỉnh cho action. Event ID phải được chỉ định trong một thuộc tính có tên `event_id`. |
| `channel` | Kích hoạt một channel thông báo cho action. Channel ID phải được chỉ định trong một thuộc tính có tên `channel_id`. |
| `disable` | Vô hiệu hóa event cho action (không có thuộc tính bổ sung nào được xác định). |
| `delete` | Xóa event cho action (không có thuộc tính bổ sung nào được xác định). |
| `snapshot` | Chụp một snapshot của server cho action (không có thuộc tính bổ sung nào được xác định). |
| `suspend` | Đình chỉ (tạm dừng) một workflow cho đến khi người dùng tiếp tục lại trong giao diện người dùng. Không có thuộc tính bổ sung nào được xác định. |
| `tag` | Thêm một hoặc nhiều [Tags](tags.md) vào job hoặc workflow đang chạy. |
| `store` | Lưu trữ dữ liệu trong một bucket lưu trữ. Yêu cầu `bucket_id` ([Bucket.id](#bucket-id)), `bucket_sync` (chỉ định nếu các tập tin và/hoặc dữ liệu nên được lưu trữ) và `bucket_glob` (mẫu glob để khớp trên các tập tin). |
| `fetch` | Lấy dữ liệu từ một bucket lưu trữ. Yêu cầu `bucket_id` ([Bucket.id](#bucket-id)), `bucket_sync` (chỉ định nếu các tập tin và/hoặc dữ liệu nên được lấy) và `bucket_glob` (mẫu glob để khớp trên các tập tin). |
| `ticket` | Tạo một ticket. Yêu cầu `ticket_type` (xem [Ticket.type](#ticket-type)), `ticket_assignees` (một mảng các [User.username](#user-username)) và `ticket_tags` (một mảng các [Tag.id](#tag-id)). Cũng có thể bao gồm `ticket_due`, dưới dạng thời gian epoch Unix tuyệt đối hoặc độ lệch ngày tương đối như `3 days`. |
| `plugin` | Gọi một Plugin tùy chỉnh cho action. Yêu cầu `plugin_id` ([Plugin.id](#plugin-id)) và `params` (các tham số tùy chỉnh được xác định bởi Plugin). |

### Limit

Các limit (còn được gọi là "Resource Limits" trong giao diện người dùng) chi phối những thứ như CPU, bộ nhớ và kích thước nhật ký cho các job đang chạy. Chúng có thể được gán cho cả event và category, và mỗi thuộc tính có thể có một số limit khác nhau được đặt. Đây là một ví dụ:

```json
{
	"type": "time",
	"enabled": true,
	"duration": 3600
}
```

Điều này sẽ đặt limit thời gian là 3600 giây (1 giờ) cho các job đang chạy.

Mỗi đối tượng limit phải có các thuộc tính sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `enabled` | Boolean | Chỉ định xem limit được bật (`true`) hay bị tắt (`false`). |
| `type` | String | Chỉ định loại limit. Xem [Limit.type](#limit-type) bên dưới. |

Các thuộc tính bổ sung có thể có mặt tùy thuộc vào loại.

Khi các limit được gán cho các category, chúng hoạt động như mặc định cho các event trong category đó. Các event vẫn có thể ghi đè các limit được đặt trong các category của chúng.

#### Limit.type

Mỗi limit có một thuộc tính `type` chỉ định những gì nó chi phối. Các loại khác nhau được mô tả bên dưới:

| Type ID | Title | Description |
|---------|-------|-------------|
| `time` | **Max Run Time** | Đặt thời gian chạy tối đa cho các job. limit phải nằm trong một thuộc tính có tên `duration`, được chỉ định bằng giây. |
| `job` | **Max Concurrent Jobs** | Đặt số lượng job đồng thời tối đa cho event. Số lượng phải nằm trong một thuộc tính có tên `amount`. |
| `log` | **Max Output Size** | Đặt limit tối đa về kích thước đầu ra cho các job. limit phải nằm trong một thuộc tính có tên `amount`, được chỉ định bằng byte. |
| `mem` | **Max Memory Limit** | Đặt limit tối đa cho việc sử dụng bộ nhớ cho các job (bao gồm tất cả các tiến trình con). limit phải nằm trong một thuộc tính có tên `amount`, được chỉ định bằng byte. Thời lượng duy trì phải nằm trong một thuộc tính có tên `duration`, được chỉ định bằng giây. |
| `cpu` | **Max CPU % Limit** | Đặt limit tối đa cho việc sử dụng CPU cho các job (bao gồm tất cả các tiến trình con). limit phải nằm trong một thuộc tính có tên `amount`, được chỉ định dưới dạng tỷ lệ phần trăm của một lõi CPU. Thời lượng duy trì phải nằm trong một thuộc tính có tên `duration`, được chỉ định bằng giây. |
| `retry` | **Max Retry Limit** | Đặt số lần thử lại tối đa được phép đối với các job thất bại. Số lần thử lại phải nằm trong một thuộc tính có tên `amount` và tùy chọn độ trễ giữa các lần thử lại phải nằm trong một thuộc tính có tên `duration`, được chỉ định bằng giây. |
| `queue` | **Max Queue Limit** | Đặt số lượng job tối đa có thể được đưa vào hàng đợi, nếu các limit khác ngăn chúng chạy đồng thời. Số lượng phải nằm trong một thuộc tính có tên `amount`. |
| `file` | **Max File Limit** | Đặt limit về số lượng và loại tập tin được job cho phép. Đây là limit mềm và không hủy bỏ job (các tập tin bị cắt bớt nếu vượt quá limit). |

Các loại limit **Max Run Time** (`time`), **Max Memory Limit** (`mem`), **Max CPU % Limit** (`cpu`) và **Max Output Size** (`log`) đều chấp nhận một tập hợp các tham số bổ sung cho phép các action đặc biệt diễn ra khi vượt quá limit:

| Property Name | Type | Description |
|---------------|------|-------------|
| `tags` | Array | Một tập hợp các [Tag.id](#tag-id) tùy chọn để áp dụng cho job khi vượt quá limit. |
| `users` | Array | Một tập hợp các [User.username](#user-username) tùy chọn để gửi email về việc vi phạm limit. |
| `email` | String | Một danh sách các địa chỉ email tùy chỉnh (ở định dạng CSV) tùy chọn để gửi tới. |
| `web_hook` | String | Một [WebHook.id](#webhook-id) tùy chọn để kích hoạt khi vượt quá limit. |
| `text` | String | Nếu `web_hook` được điền, điều này có thể chứa một chuỗi văn bản tùy chỉnh để nối thêm vào văn bản web hook. |
| `snapshot` | Boolean | Nếu được đặt là `true`, một [snapshot của server](snapshots.md) sẽ được chụp khi vượt quá limit. |
| `abort` | Boolean | Nếu được đặt là `true`, job sẽ bị hủy khi vượt quá limit. |

### Trigger

Các event được lên lịch bằng cách sử dụng một hoặc nhiều đối tượng trigger, có thể xác định các lần kích hoạt lặp lại (hàng giờ, hàng ngày, v.v.), chạy một lần vào một ngày/giờ chính xác trong tương lai và các quy tắc khác như ngày cấm. Đây là một ví dụ:

```json
{
	"type": "schedule",
	"enabled": true,
	"hours": [ 4 ],
	"minutes": [ 30 ]
}
```

Điều này sẽ chạy hàng ngày lúc 4:30 sáng (lặp lại).

Mỗi đối tượng trigger phải có các thuộc tính sau:

| Property Name | Type | Description |
|---------------|------|-------------|
| `enabled` | Boolean | Chỉ định xem trigger được bật (`true`) hay bị tắt (`false`). |
| `type` | String | Chỉ định loại trigger. Xem [Trigger.type](#trigger-type) bên dưới. |

Các thuộc tính bổ sung có thể có mặt tùy thuộc vào loại.

#### Trigger.type

Mỗi trigger có một thuộc tính `type` mô tả hành vi của nó. Các loại khác nhau được liệt kê bên dưới:

| Type ID | Title | Description |
|---------|-------|-------------|
| `manual` | **Manual Run** | Cho phép event được thực thi thủ công (trong giao diện người dùng hoặc API). |
| `schedule` | **Schedule** | Đặt một lịch trình lặp lại để chạy event (hàng giờ, hàng ngày, v.v.). Xem [Schedule Rules](#schedule-rules) bên dưới. |
| `interval` | **Interval** | Chạy event theo khoảng thời gian lặp lại, cho trước ngày/giờ bắt đầu. Xem [Intervals](#intervals) bên dưới. |
| `single` | **Single Shot** | Đặt một ngày/giờ chính xác trong tương lai để chạy duy nhất một lần. Yêu cầu một thuộc tính `epoch` bổ sung, được đặt thành [dấu thời gian Unix](https://en.wikipedia.org/wiki/Unix_time) tại đó để chạy. |
| `catchup` | **Catch-Up** | Đảm bảo rằng *mọi* job đã lên lịch đều chạy, ngay cả khi nó phải chạy trễ. |
| `nth` | **Every Nth** | Chỉ chạy cứ mỗi job đã lên lịch thứ N. Xem [Every Nth](triggers.md#every-nth) để biết chi tiết. |
| `range` | **Range** | Đặt ngày bắt đầu và/hoặc ngày kết thúc cho một event lặp lại. Yêu cầu các thuộc tính `start` và/hoặc `end` bổ sung, được đặt thành [dấu thời gian Unix](https://en.wikipedia.org/wiki/Unix_time). |
| `blackout` | **Blackout** | Đặt phạm vi ngày/giờ cấm khi event *không thể* chạy. Yêu cầu các thuộc tính `start` và `end` bổ sung, được đặt thành [dấu thời gian Unix](https://en.wikipedia.org/wiki/Unix_time). |
| `delay` | **Delay** | Đặt độ trễ bắt đầu tùy chọn cho tất cả các job đã lên lịch. Yêu cầu một thuộc tính `duration` bổ sung, được đặt bằng số giây để làm trễ mỗi job. |
| `precision` | **Precision** | Đặt một mảng tùy chọn các giây chính xác để kích hoạt các job trong phút đã lên lịch hiện tại. |
| `plugin` | **Plugin** | Plugin bộ lập lịch tùy chỉnh (do người dùng xác định). Yêu cầu một thuộc tính `plugin_id` bổ sung, cũng như một đối tượng `params`, để cấu hình do Plugin xác định. |

##### Schedule Rules

Loại `schedule` mô tả một event lặp lại (khi nào và mức độ thường xuyên nó sẽ chạy các job). Nó hoạt động tương tự như hệ thống [Unix Cron](https://en.wikipedia.org/wiki/Cron), với các lựa chọn về năm, tháng, ngày, ngày trong tuần, giờ và/hoặc phút. Mỗi thuộc tính phải là một mảng các giá trị số. Nếu bị bỏ qua, nó có nghĩa tương tự như "tất cả" trong hạng mục đó (tức là dấu hoa thị `*` trong cú pháp Cron).

Ví dụ, một event với đối tượng trigger này sẽ chạy mỗi giờ một lần, vào đúng giờ:

```json
{
	"type": "schedule",
	"enabled": true,
	"minutes": [0]
}
```

Về cơ bản nó có nghĩa là mỗi năm, mỗi tháng, mỗi ngày, mỗi giờ, nhưng chỉ ở phút `0`. Bộ lập lịch chỉ đánh dấu một lần một phút, do đó điều này chỉ dẫn đến việc chạy một job cho mỗi phút khớp.

Một ví dụ khác, điều này sẽ chạy hai lần mỗi ngày, lúc 4:30 sáng và 4:30 chiều:

```json
{
	"type": "schedule",
	"enabled": true,
	"hours": [4, 16],
	"minutes": [30]
}
```

Đối với một ví dụ phức tạp hơn, điều này sẽ chỉ chạy vào năm 2023, từ tháng 3 đến tháng 5, vào ngày 1 và 15 của tháng (nhưng chỉ khi cũng là các ngày trong tuần), từ 6 sáng đến 10 sáng, và vào phút :15 và :45 của những giờ đó:

```json
{
	"type": "schedule",
	"enabled": true,
	"years": [2023],
	"months": [3, 4, 5],
	"days": [1, 15],
	"weekdays": [1, 2, 3, 4, 5],
	"hours": [6, 7, 8, 9, 10],
	"minutes": [15, 45]
}
```

Dưới đây là danh sách tất cả các thuộc tính đối tượng trigger loại `schedule` và mô tả của chúng:

| Trigger Property | Range | Description |
|-----------------|-------|-------------|
| `years` | ∞ | Một hoặc nhiều năm ở định dạng YYYY. |
| `months` | 1 - 12 | Một hoặc nhiều tháng, trong đó tháng Giêng là 1 và tháng Mười Hai là 12. |
| `days` | 1 - 31 | Một hoặc nhiều ngày trong tháng, từ 1 đến 31. |
| `weekdays` | 0 - 6 | Một hoặc nhiều ngày trong tuần, trong đó Chủ Nhật là 0 và Thứ Bảy là 6. |
| `hours` | 0 - 23 | Một hoặc nhiều giờ trong thời gian 24 giờ, từ 0 đến 23. |
| `minutes` | 0 - 59 | Một hoặc nhiều phút, từ 0 đến 59. |
| `timezone` | n/a | Múi giờ tùy chọn để đánh giá mục lịch trình. Mặc định là múi giờ của server conductor. |

##### Intervals

Loại trigger interval yêu cầu một `start` (giây epoch) và một `duration` (khoảng thời gian tính bằng giây). Ví dụ:

```json
{
	"type": "interval",
	"enabled": true,
	"start": 1766111340,
	"duration": 90
}
```

Thời gian `start` ví dụ đó là 2025/12/18 18:29:00 Pacific, vì vậy nó sẽ chạy event vào đúng dấu thời gian đó, và sau đó chạy lại cứ sau 90 giây. Ví dụ:

- 2025/12/18 18:29:00 Pacific
- 2025/12/18 18:30:30 Pacific
- 2025/12/18 18:32:00 Pacific
- 2025/12/18 18:33:30 Pacific
- ...và cứ tiếp tục như vậy.

### Workflow

Các workflow thực sự chỉ là các [Event](#event) với một thuộc tính `workflow` bổ sung, mô tả luồng. Xem [Workflows](workflows.md) để biết thêm chi tiết về các workflow. Đây là một ví dụ đối tượng workflow ở định dạng JSON:

```json
{
	"nodes": [
		{
			"id": "nufslsj6",
			"type": "trigger",
			"x": 100,
			"y": 340
		},
		{
			"id": "n05zzi1i",
			"type": "event",
			"data": {
				"event": "emdzenjw3hz",
				"params": {},
				"targets": [],
				"algo": "",
				"tags": [],
				"replay": "jmhc0du7n8k"
			},
			"x": 306,
			"y": 235
		},
		{
			"id": "nx7qqkld",
			"type": "action",
			"data": {
				"enabled": true,
				"type": "suspend",
				"users": [],
				"email": "",
				"web_hook": "example_hook",
				"text": ""
			},
			"x": 660,
			"y": 87
		},
		{
			"id": "nyywkijs",
			"type": "job",
			"data": {
				"params": {
					"duration": "10",
					"action": "Success",
					"burn": false,
					"network": false,
					"upload": true
				},
				"targets": [
					"main"
				],
				"algo": "random",
				"label": "",
				"category": "general",
				"plugin": "testplug",
				"tags": []
			},
			"x": 699,
			"y": 249
		}
	],
	"connections": [
		{
			"id": "ctfb86vr",
			"source": "nufslsj6",
			"dest": "n05zzi1i"
		},
		{
			"id": "ce47saf7",
			"source": "n05zzi1i",
			"dest": "nx7qqkld",
			"condition": "start"
		},
		{
			"id": "cnns5qvj",
			"source": "n05zzi1i",
			"dest": "nyywkijs",
			"condition": "success"
		}
	]
}
```

#### Workflow.nodes

Mảng các [WorkflowNode](#workflownode) trong workflow.

#### Workflow.connections

Mảng các [WorkflowConnection](#workflowconnection) trong workflow.

### WorkflowNode

Một workflow node là một đối tượng đại diện cho một event, ad-hoc job, trigger, limit, action, hoặc controller. Dưới đây là ví dụ node ở định dạng JSON:

```json
{
	"id": "n05zzi1i",
	"type": "event",
	"data": {
		"event": "emdzenjw3hz",
		"params": {},
		"targets": [],
		"algo": "",
		"tags": []
	},
	"x": 306,
	"y": 235
}
```

#### WorkflowNode.id

ID duy nhất kết hợp chữ cái và số viết thường cho node, được gán tự động khi tạo. Workflow Node ID sẽ luôn bắt đầu bằng `n`.

#### WorkflowNode.type

Hằng chuỗi đại diện cho loại node, sẽ là một trong: `event`, `job`, `trigger`, `limit`, `action`, hoặc `controller`.

#### WorkflowNode.data

Các node có thể có thuộc tính `data` chứa thông tin cụ thể cho loại node đó. Dưới đây là tóm tắt cách thuộc tính này được sử dụng:

| Node Type | Data Description |
|-----------|------------------|
| `event` | Sẽ chứa thuộc tính `event`, tham chiếu đến [Event](#event), cũng như các thuộc tính ghi đè mặc định được đặt trong event. Có thể chứa một thuộc tính `replay` tuỳ chọn. |
| `job` | Sẽ chứa hầu hết các thuộc tính từ đối tượng [Event](#event), để chạy ad-hoc job mà không cần định nghĩa event rõ ràng. Có thể chứa một thuộc tính `replay` tuỳ chọn. |
| `trigger` | Không được sử dụng. Các trigger node sử dụng thuộc tính [WorkflowNode.id](#workflownode-id) của chúng để liên kết với [Event.trigger](#event-trigger), đây là nguồn tin cậy cho trigger. |
| `limit` | Sẽ chứa các thuộc tính từ đối tượng [Limit](#limit). |
| `action` | Sẽ chứa các thuộc tính từ đối tượng [Action](#action). |
| `controller` | Sẽ chứa các thuộc tính cụ thể cho loại controller. Xem bên dưới. |

Đối với các node `event` và `job`, thuộc tính `replay` tuỳ chọn có thể chứa một [Job.id](#job-id) trước đó. Khi giá trị này được đặt, workflow node sẽ chạy lại job trước đó thay vì khởi chạy một sub-job mới. Job được chạy lại sẽ đóng góp output data gốc, output files, `workflowData`, các tag và kết quả hoàn thành vào workflow, và các điều kiện luồng ở các bước tiếp theo sẽ được đánh giá từ kết quả được chạy lại đó.

Đối với các controller node, xem bảng sau để biết chi tiết về cách thuộc tính `data` được sử dụng:

| Controller Type | Data Description |
|-----------------|------------------|
| `multiplex` | Sẽ chứa `stagger` (độ trễ tính bằng giây) để làm các job chạy so le nhau qua các server, và `continue` (phần trăm) để làm cổng cho sự thành công. |
| `wait` | Sẽ chứa `wait` (độ trễ tính bằng giây). |
| `repeat` | Sẽ chứa `repeat` (số vòng lặp), và `continue` (phần trăm) để làm cổng cho sự thành công. |
| `split` | Sẽ chứa `split` (biểu thức để phân chia), và `continue` (phần trăm) để làm cổng cho sự thành công. |
| `join` | Không được sử dụng. |
| `decision` | Sẽ chứa `label` (tiêu đề tuỳ chỉnh), `icon` (biểu tượng tuỳ chỉnh), và `decision` (biểu thức để đánh giá). |

#### WorkflowNode.x

Vị trí ngang của góc trên cùng bên trái của node trong UI, được đo bằng các CSS pixel ở mức thu phóng 1X.

#### WorkflowNode.y

Vị trí dọc của góc trên cùng bên trái của node trong UI, được đo bằng các CSS pixel ở mức thu phóng 1X.

### WorkflowConnection

Một đối tượng workflow connection đại diện cho kết nối giữa hai node (được hiển thị dưới dạng đường cong trong UI). Dưới đây là ví dụ về kết nối ở định dạng JSON:

```json
{
	"id": "cnns5qvj",
	"source": "n05zzi1i",
	"dest": "nyywkijs",
	"condition": "success"
}
```

#### WorkflowConnection.id

ID duy nhất kết hợp chữ cái và số viết thường cho kết nối, được gán tự động khi tạo. Workflow Connection ID sẽ luôn bắt đầu bằng `c`.

#### WorkflowConnection.source

[WorkflowNode.id](#workflownode-id) của node nguồn.

#### WorkflowConnection.dest

[WorkflowNode.id](#workflownode-id) của node đích.

#### WorkflowConnection.condition

Một số kết nối có một `condition` quy định khi nào quyền điều khiển sẽ chuyển qua node đích (cụ thể là từ một job hoặc event tới node khác). Xem [Action.conditions](#action-condition) để biết danh sách các điều kiện có thể.

### JobWorkflow

Khi một job bắt đầu, nếu bản thân job đó là một workflow, hoặc là một sub-job bên trong một workflow, nó sẽ được cung cấp một đối tượng `workflow`, được mô tả bên dưới. Dưới đây là một ví dụ đối tượng ở định dạng JSON, cho một workflow job, nhưng một số thuộc tính đã bị xoá đi để cho ngắn gọn:

```json
{
	"nodes": [],
	"connections": [],
	"start": "n1b47xt7",
	"state": {
		"n1b47xt7": {
			"started": 1762288805.097,
			"completed": 1762288805.102
		},
		"n24wos41": {
			"started": 1762288805.097
		},
		"ns3n5uyn": {
			"started": 1762288811.225
		}
	},
	"jobs": {
		"n24wos41": [
			{
				"id": "jmhl194oawj",
				"code": 0,
				"description": "Success!",
				"server": "smf4j79snhe",
				"completed": 1762288811.194,
				"elapsed": 6.0929999351501465,
				"tags": [
					"_success",
					"_last"
				],
				"files": [
					{
						"id": "fmhl199ehrw",
						"date": 1762288811,
						"filename": "sample-report-jmhl194oawj.txt",
						"path": "files/jobs/jmhl194oawj/OqTsdjeTWM8cn8PlxaYrow/sample-report-jmhl194oawj.txt",
						"size": 745,
						"server": "smf4j79snhe",
						"job": "jmhl194oawj"
					}
				]
			}
		],
		"ns3n5uyn": [
			{
				"id": "jmhl199ehxh",
				"code": 503,
				"description": "HTTP 503 Service Temporarily Unavailable",
				"server": "smf4j79snhe",
				"completed": 1762288812.95,
				"elapsed": 1.7220001220703125,
				"tags": [
					"_error",
					"_last"
				],
				"files": []
			}
		]
	},
	"job": "jg80dllhd",
	"event": "emjg80nybpf",
	"node": "n58oqrxk",
	"launcher": "n3s4kehz",
	"params": {
		"foo": "bar"
	},
}
```

### JobWorkflow.nodes

Mảng các [WorkflowNode](#workflownode) trong workflow.

### JobWorkflow.connections

Mảng các [WorkflowConnection](#workflowconnection) trong workflow.

### JobWorkflow.start

[WorkflowNode.id](#workflownode-id) của node bắt đầu (thường là một trigger node).

### JobWorkflow.state

Chứa thông tin trạng thái cho mỗi node trong workflow. Thường nó được sử dụng để theo dõi các node nào đã thực thi, và để theo dõi hiệu suất. Đối tượng được khoá bởi [WorkflowNode.id](#workflownode-id) của các node, với giá trị cụ thể cho mỗi node. Ví dụ ở định dạng JSON:

```json
{
	"n1b47xt7": {
		"started": 1762288805.097,
		"completed": 1762288805.102
	},
	"n24wos41": {
		"started": 1762288805.097
	},
	"ns3n5uyn": {
		"started": 1762288811.225
	}
}
```

### JobWorkflow.jobs

Chứa thông tin về tất cả các job đã hoàn thành bên trong workflow. Đối tượng `jobs` được khoá bởi [WorkflowNode.id](#workflownode-id) của các node đã sinh ra các job, và giá trị là một mảng các đối tượng (vì mỗi node có thể sinh ra nhiều job trong cùng một workflow). Dưới đây là một ví dụ:

```json
{
	"ns3n5uyn": [
		{
			"id": "jmhl199ehxh",
			"code": 503,
			"description": "HTTP 503 Service Temporarily Unavailable",
			"server": "smf4j79snhe",
			"completed": 1762288812.95,
			"elapsed": 1.7220001220703125,
			"tags": [
				"_error",
				"_last"
			],
			"files": [],
			"replay": true
		}
	]
}
```

Mỗi phần tử của mảng là một tập hợp con các thuộc tính được sao chép từ đối tượng [Job](#job).

Nếu node được cấu hình để chạy lại một job trước đó, bản nháp completed-job sẽ bao gồm `replay: true`.

### JobWorkflow.job

Nếu job là một sub-job bên trong một workflow cha, thuộc tính `workflow.job` sẽ trỏ đến [Job.id](#job-id) của workflow job cha.

### JobWorkflow.event

Nếu job là một sub-job bên trong một workflow cha, thuộc tính `workflow.event` sẽ trỏ đến [Event.id](#event-id) của workflow cha.

### JobWorkflow.node

Nếu job là một sub-job bên trong một workflow cha, thuộc tính `workflow.node` sẽ trỏ đến [WorkflowNode.id](#workflownode-id) của node event hoặc node job đã bắt đầu job.

### JobWorkflow.launcher

Nếu job là một sub-job bên trong một workflow cha, thuộc tính `workflow.launcher` sẽ trỏ đến [WorkflowNode.id](#workflownode-id) của node controller đang quản lý job đó.

### JobWorkflow.params

Nếu job là một sub-job bên trong một workflow cha, thuộc tính `workflow.params` sẽ chứa tất cả các user parameter được cung cấp khi khởi chạy workflow (nếu có).

### JobWorkflow.now

Nếu job là một sub-job bên trong một workflow cha, thuộc tính `workflow.now` sẽ chứa giá trị [Job.now](#job-now) của workflow cha. Giá trị này có thể là timestamp khi workflow bắt đầu, hoặc có thể là timestamp trong quá khứ nếu workflow đang được chạy như một phần của [Catch-Up](triggers.md#catch-up).

### Privileges

Đối tượng Privileges mô tả những hành động nào được cho phép đối với một [User](#user), một [Role](#role), hoặc một [API Key](#api-key). Để biết thêm chi tiết, hãy xem [Privileges](privileges.md). Dưới đây là một tập hợp các privilege ví dụ ở định dạng JSON:

```json
{
	"create_events": true,
	"edit_events": true,
	"run_jobs": true,
	"tag_jobs": true,
	"create_tickets": true,
	"edit_tickets": true
}
```

Lưu ý rằng privilege `admin`, khi hiện diện, sẽ mặc nhiên bật tất cả các privilege khác.

### JobHookData

Khi các job action được thực thi, bao gồm việc kích hoạt web hook và gửi email, cấu trúc dữ liệu sau được sử dụng để mở rộng các macro trong văn bản web hook và nội dung thân email. Nó cũng được truyền đến các custom action Plugin.

| Property Path | Type | Description |
|---------------|------|-------------|
| `job` | Object | Đối tượng [Job](#job) hiện tại. |
| `action` | Object | Đối tượng [Action](#action) hiện tại. |
| `event` | Object | Đối tượng [Event](#event) từ đó job được khởi chạy. |
| `category` | Object | Đối tượng [Category](#category) cho category của job. |
| `plugin` | Object | Đối tượng [Plugin](#plugin) cho event plugin của job (không áp dụng cho workflow). |
| `server` | Object | Đối tượng [Server](#server) cho server đã chạy job (nếu áp dụng). |
| `nice_server` | String | Một biểu diễn chuỗi dễ đọc của server hiện tại (tiêu đề, hostname hoặc conductor host ID). |
| `nice_hostname` | String | Một biểu diễn chuỗi dễ đọc của hostname server hiện tại, nếu áp dụng. |
| `links` | Object | Một đối tượng chứa các URL để sử dụng trong văn bản thân email hoặc văn bản web hook. |
| `links.job_details` | String | Một URL đầy đủ tới trang chi tiết job (yêu cầu đăng nhập). |
| `links.job_log` | String | Một URL đầy đủ tới output gốc của job (xác thực được bao gồm trong URL). |
| `links.job_files` | String | Một danh sách URL được định dạng markdown tới tất cả các output file của job (xác thực được bao gồm trong các URL). |
| `display` | Object | Một đối tượng chứa các chuỗi được định dạng sẵn sàng để hiển thị. |
| `display.elapsed` | String | Thời gian trôi qua của job ở định dạng dễ đọc cho người, nếu kích hoạt khi job hoàn thành. |
| `display.log_size` | String | Kích thước output của job ở định dạng dễ đọc cho người, nếu áp dụng. |
| `display.perf` | String | Chuỗi đại diện cho các chỉ số hiệu suất của job, nếu được cung cấp. |
| `display.mem` | String | Chuỗi dễ đọc cho người đại diện cho mức sử dụng bộ nhớ trung bình của job, nếu có. |
| `display.cpu` | String | Chuỗi dễ đọc cho người đại diện cho mức sử dụng CPU trung bình của job, nếu có. |
| `text` | String | Bản tóm tắt ngắn về action, sử dụng [hook_text_templates](config.md#hook_text_templates) làm template, với tất cả macro được mở rộng. |

### AlertHookData

Khi các alert được kích hoạt và xoá, cấu trúc dữ liệu sau được sử dụng để mở rộng các macro trong văn bản web hook và nội dung thân email. Nó cũng được truyền đến các Action Plugin:

| Property Path | Type | Description |
|---------------|------|-------------|
| `condition` | String | Action hiện tại đang diễn ra, sẽ là một trong `alert_new` hoặc `alert_cleared`. |
| `alert_def` | Object | Đối tượng định nghĩa [Alert](#alert) hiện tại. |
| `alert` | Object | Đối tượng [AlertInvocation](#alertinvocation) hiện tại. |
| `params` | Object | Dữ liệu [ServerMonitorData](#servermonitordata) hiện tại từ server. |
| `server` | Object | Đối tượng [Server](#server) cho server mà trên đó alert đã kích hoạt hoặc xoá. |
| `active_jobs` | Array | Mảng các job đang hoạt động hiện tại trên server, mỗi job có thuộc tính `id` ([Job.id](#job-id)) và `event` ([Event.id](#event-id)). |
| `date_time` | String | Chuỗi ngày/giờ được bản địa hoá dễ đọc cho người, theo múi giờ của server. |
| `nice_group` | String | Chuỗi đại diện cho tiêu đề của nhóm server chính. |
| `nice_elapsed` | String | Biểu diễn dễ đọc cho người về thời gian trôi qua của alert (nếu `alert_cleared`). |
| `nice_load_avg` | String | Biểu diễn chuỗi về load average của server hiện tại. |
| `nice_mem_total` | String | Biểu diễn chuỗi về tổng bộ nhớ của server hiện tại. |
| `nice_mem_avail` | String | Biểu diễn chuỗi về bộ nhớ khả dụng của server hiện tại. |
| `nice_uptime` | String | Biểu diễn chuỗi về thời gian hoạt động (uptime) của server hiện tại. |
| `nice_cpu` | String | Biểu diễn chuỗi về mức sử dụng CPU của server hiện tại. |
| `nice_os` | String | Biểu diễn chuỗi về hệ điều hành của server hiện tại. |
| `nice_notes` | String | Trường ghi chú hiện tại của alert, từ định nghĩa alert. |
| `nice_hostname` | String | Biểu diễn chuỗi về hostname của server hiện tại. |
| `nice_server` | String | Biểu diễn chuỗi về tiêu đề của server hiện tại (hoặc hostname, nếu không có tiêu đề tuỳ chỉnh). |
| `nice_virt` | String | Biểu diễn chuỗi về hệ thống ảo hoá / container của server hiện tại, nếu áp dụng. |
| `links` | Object | Một đối tượng chứa các URL để sử dụng trong văn bản thân email hoặc văn bản web hook. |
| `links.server_url` | String | Một URL đầy đủ tới trang chi tiết job (yêu cầu đăng nhập). |
| `links.alert_url` | String | Một URL đầy đủ tới trang chi tiết job (yêu cầu đăng nhập). |
| `text` | String | Bản tóm tắt ngắn về action, sử dụng [hook_text_templates](config.md#hook_text_templates) làm template, với tất cả macro được mở rộng. |

### QuickmonData

PTOps chụp dữ liệu giám sát "nhanh" mỗi giây trên mỗi server, trong một số khía cạnh chính (CPU / mem / net / disk). Dữ liệu này được sử dụng để hiển thị màn hình giám sát server theo thời gian thực, và cũng được sử dụng trong các snapshot của server. Dưới đây là dữ liệu Quickmon mẫu ở định dạng JSON:

```json
{
	"_qm_cpu_load": 0,
	"_qm_cpu_usage": 0,
	"_qm_disk_read_sec": 7317065728,
	"_qm_disk_write_sec": 104329216,
	"_qm_mem_avail": 16180023296,
	"_qm_mem_used": 630362112,
	"_qm_net_in_sec": 1168348,
	"_qm_net_out_sec": 24974039,
	"date": 1754793680
}
```

`date` là thời gian lấy mẫu tính bằng Unix giây. Các thuộc tính khác tương ứng với các định nghĩa Quickmon monitor trong [quick_monitors](config.md#quick_monitors), và tất cả các giá trị nên là số thô.

### ServerTimelineData

Mỗi phút, PTOps lấy [ServerMonitorData](#servermonitordata) hiện tại từ mỗi server, trích xuất tất cả giá trị [Monitor](#monitor), và lưu trữ chúng trong một cơ sở dữ liệu chuỗi thời gian chuyên biệt. Dưới đây là một mục nhập ví dụ ở định dạng JSON:

```json
{
	"count": 1,
	"date": 1754449800,
	"epoch_div": 29240830,
	"totals": {
		"active_jobs": 0,
		"cpu_usage": 0.14,
		"disk_iops_sec": 17188,
		"disk_read_sec": 818495488,
		"disk_usage_root": 5.09,
		"disk_write_sec": 26660864,
		"io_wait": 0,
		"load_avg": 0,
		"mem_free": 16167579648,
		"mem_used": 642805760,
		"mmdze1gznbt": 41861120,
		"net_conns": 4,
		"open_files": 1152,
		"os_bytes_in_sec": 122642,
		"os_bytes_out_sec": 2633375,
		"total_procs": 24
	}
}
```

Đối tượng bao gồm các thuộc tính sau:

| Property Path | Type | Description |
|---------------|------|-------------|
| `count` | Number | Số lượng các mẫu đại diện trong mục nhập DB này. Đối với các hệ thống daily, monthly và yearly, giá trị này thường sẽ lớn hơn 1, và tất cả tổng số sẽ được chia cho nó (nghĩa là lấy trung bình). |
| `date` | Number | Ngày/giờ của mẫu đầu tiên trong mục nhập DB, tính bằng Unix giây. |
| `epoch_div` | Number | Số Unix giây chia cho một hằng số được định nghĩa bởi hệ thống hiện tại. |
| `totals` | Object | Một đối tượng chứa tất cả các tổng của [Monitor](#monitor). |

### File

Đối tượng file được sử dụng để biểu diễn một tệp tin trong bộ lưu trữ. Nó được sử dụng cho [Job.files](#job-files), [Ticket.files](#ticket-files), và [Bucket.files](#bucket-files). Đối tượng bao gồm các thuộc tính sau:

| Property Path | Type | Description |
|---------------|------|-------------|
| `path` | String | Đường dẫn được chuẩn hoá đến tệp tin trong bộ lưu trữ, cái mà cũng có thể được sử dụng làm URI path để xem / tải xuống. |
| `filename` | String | Tên của tệp tin. |
| `size` | Number | Kích thước của tệp tin tính bằng byte. |
| `date` | Number | Ngày tạo tệp tin tính bằng Unix giây. |
| `job` | String | Nếu tệp tin được tạo từ một job, thuộc tính này sẽ chứa [Job.id](#job-id). |
| `server` | String | Nếu tệp tin được tạo trên một server, thuộc tính này sẽ chứa [Server.id](#server-id). |
| `ticket` | String | Nếu tệp tin được tạo cho một ticket, thuộc tính này sẽ chứa [Ticket.id](#ticket-id). |

Dưới đây là một ví dụ ở định dạng JSON:

```json
{
	"id": "fmi4us46yno",
	"date": 1763487257,
	"filename": "report-optimized.png",
	"path": "files/tmhzbmbagig/admin/tQq3xZEQR2_vhvhh4L8WnA/report-optimized.png",
	"size": 29959,
	"username": "admin",
	"ticket": "tmhzbmbagig"
}
```
