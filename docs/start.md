# Bắt Đầu Với PTOps

Hướng dẫn này đưa bạn từ một bản cài PTOps mới đến vài automation hữu ích: job đầu tiên, chuỗi job (job chaining), limit hàng chờ (queue limit), web hook khi lỗi, và một workflow nhỏ.

Mục tiêu ở đây không phải là bao quát mọi tuỳ chọn. Mục tiêu là giúp bạn định hướng, tránh những cạm bẫy setup thường gặp, và cho thấy các phần ghép lại với nhau như thế nào.

Với tài liệu tham khảo chi tiết hơn, mỗi phần đều dẫn link tới docs đầy đủ.


## Bạn Sẽ Xây Dựng Gì

Đến cuối hướng dẫn này, bạn sẽ có:

- Một conductor PTOps đang chạy.
- Ít nhất một server có thể chạy job.
- Một event "Hello World".
- Một event thứ hai được trigger bởi event đầu tiên.
- Một job script cơ bản báo cáo progress và output data.
- Một concurrency limit kèm queueing.
- Một web hook action kích hoạt khi job lỗi.
- Một workflow đơn giản với trigger node, event node, và action node.


## Vài Thuật Ngữ Trước

PTOps có một tập nhỏ khái niệm cốt lõi:

- **Conductor**: Server PTOps chính. Nó host UI, scheduler, API, và logic điều phối.
- **xySat**: Agent nhẹ chạy trên worker server. Nó thực thi job và gửi số liệu giám sát về PTOps.
- **Server**: Một xySat worker đã đăng ký, hoặc xySat local đi kèm conductor để test.
- **Event**: Một định nghĩa có thể tái sử dụng để khởi chạy một loại job.
- **Job**: Một lần chạy thực tế của event (các app khác gọi đây là "execution" hoặc "task").
- **Trigger**: Một quy tắc khởi chạy job hoặc workflow, như Manual, Schedule, Interval, hoặc Single Shot.
- **Action**: Một phản ứng chạy khi job đạt tới một điều kiện được chọn, như start, success, error, hoặc completion. Action có thể gửi email, bắn web hook, chạy event khác, gọi Action Plugin, và hơn nữa.
- **Limit**: Một rào chắn cho job, như thời gian chạy tối đa, số job đồng thời tối đa, hoặc kích thước hàng chờ tối đa.
- **Workflow**: Một đồ thị trực quan kết nối trigger, event, job, action, limit, và controller.

Hầu hết automation mới nên bắt đầu ở dạng event đơn giản. Dùng workflow khi bạn cần điều phối trực quan, phân nhánh, fan-out, fan-in, hoặc luồng nhiều bước.


## Cài Đặt PTOps

Với lần cài thử đầu tiên, Docker là cách nhanh nhất. Chọn một hostname sẽ resolve được trên network của bạn và có thể truy cập được từ bất kỳ worker server nào bạn định thêm.

Trong ví dụ dưới đây, thay `xyops01.internal.example.com` bằng hostname conductor thật của bạn.

```sh
docker run \
	--detach \
	--init \
	--name "xyops-conductor-1" \
	--hostname "xyops01.internal.example.com" \
	-e XYOPS_masters="xyops01.internal.example.com" \
	-e XYOPS_xysat_local="true" \
	-e XYOPS_base_app_url="http://xyops01.internal.example.com:5522" \
	-e TZ="America/Los_Angeles" \
	-v xy-data:/opt/xyops/data \
	-v ./xyops01-conf:/opt/xyops/conf \
	-v ./xyops01-logs:/opt/xyops/logs \
	-v /var/run/docker.sock:/var/run/docker.sock \
	--restart unless-stopped \
	-p 5522:5522 \
	-p 5523:5523 \
	ghcr.io/pixlcore/xyops:latest
```

Sau đó mở:

```text
http://xyops01.internal.example.com:5522/
```

Tài khoản administrator mặc định là:

- **Username:** `admin`
- **Password:** `admin`

Bạn sẽ được yêu cầu đổi password ngay lần đăng nhập đầu tiên.

Xem [Self-Hosting](hosting.md) để biết về Docker Compose, cài đặt thủ công, storage, TLS, và các khuyến nghị cho production.


## Đặt Đúng Hai URL Quan Trọng

Có hai cài đặt liên quan dễ bị nhầm lẫn.

### Hostname Của Conductor

Hostname của conductor là tên network của server hoặc container PTOps. Worker server cần kết nối tới tên này.

Điều này rất quan trọng:

- Hostname phải resolve được trong DNS, Tailscale, `/etc/hosts`, hoặc bất kỳ hệ thống tên nào network của bạn dùng.
- Địa chỉ đã resolve phải truy cập được từ mọi worker server.
- Worker phải truy cập được cổng web và cổng socket satellite của conductor, thường là `5522` và `5523`.
- Nếu bạn dùng Docker, hostname của container nên là cùng một tên ổn định, có thể route tới.
- Giá trị `XYOPS_masters` phải bao gồm hostname của conductor. Với bản cài một conductor, đó chỉ là một hostname duy nhất.
- Coi hostname conductor như tên hạ tầng lâu dài. Nếu đổi sau này, bạn có thể cần cập nhật cấu hình conductor và worker.

Ví dụ:

```sh
--hostname "xyops01.internal.example.com"
-e XYOPS_masters="xyops01.internal.example.com"
```

Hãy đảm bảo điều đó hoạt động trước khi thêm worker từ xa. Nhiều tính năng PTOps phụ thuộc vào việc conductor và worker có thể route tới nhau qua hostname.

### Base App URL

`base_app_url` là URL hướng tới người dùng cho web app PTOps của bạn. Nó được dùng để tạo link đầy đủ (fully-qualified) ở những nơi như email, ticket, alert, và payload web hook.

**Quan trọng:** Đây *không phải* là host giao tiếp server-to-server.

Đặt nó thành URL mà con người nên click:

```sh
-e XYOPS_base_app_url="https://xyops.example.com"
```

Ví dụ:

| Tình Huống | `base_app_url` |
|----------|----------------|
| Test local | `http://localhost:5522` |
| Network nội bộ | `http://xyops01.internal.example.com:5522` |
| HTTPS công khai sau proxy | `https://xyops.example.com` |

Nếu bạn chạy sau proxy, load balancer, Cloudflare Tunnel, hoặc SSO gateway, sẽ có nhiều phần liên quan hơn. Bắt đầu với hướng dẫn này cho setup local hoặc nội bộ trực tiếp, sau đó xem [Self-Hosting](hosting.md), [SSO Setup](sso.md), và [Tailscale](tailscale.md) cho hosting nâng cao.


## Thêm Server Đầu Tiên

Nếu bạn đặt `XYOPS_xysat_local=true` khi khởi động Docker, PTOps sẽ chạy một agent xySat local trong container conductor. Vậy là đủ để chạy job đầu tiên của bạn.

Để thêm server khác:

1. Mở **Servers**.
2. Nhấn **Add Server**.
3. Chọn OS đích hoặc tuỳ chọn cài Docker.
4. Sao chép lệnh cài đặt được tạo ra.
5. Chạy nó trên worker server.

Worker sẽ xuất hiện online trên UI và bắt đầu truyền số liệu.

Nếu worker không xuất hiện, kiểm tra hostname của conductor và routing trước. Worker phải truy cập được conductor qua hostname đã cấu hình lúc setup.

Xem [Servers](servers.md) để biết về cấp phát tự động, group, user data, và cài đặt server.


## Tạo Event Hello World

Event là đơn vị automation cơ bản trong PTOps. Mỗi event nói rõ cái gì sẽ chạy, chạy ở đâu, khi nào chạy, và làm gì sau đó.

Tạo event đầu tiên của bạn:

1. Mở **Events**.
2. Nhấn **New Event**.
3. Đặt tiêu đề là "Hello World".
4. Chọn category "General" mặc định.
5. Chọn **Shell Plugin**.
6. Dán script này:

```sh
#!/bin/sh

# Đoạn text này xuất hiện trong job log.
echo "Hello from PTOps."

# Cách viết tắt này cập nhật thanh progress trực tiếp.
echo "25%"

# Ngủ 5 giây
sleep 5

# Bạn cũng có thể viết message JSON XYWP đầy đủ từ script Shell Plugin.
echo '{ "xy": 1, "status": "Taking a short break...", "progress": 0.5 }'

# Ngủ thêm 5 giây
sleep 5

# Đây chỉ là output log thông thường thêm.
echo "The job is almost done."

# Exit 0 báo cho Shell Plugin biết job đã thành công.
exit 0
```

Sau đó:

1. Chọn server hoặc group đích.
2. Trigger **Manual** nên đã có sẵn và được bật.
3. Lưu event.
4. Nhấn **Run Now...**.

Mở trang chi tiết job và xem log trực tiếp, thanh progress, mã kết quả, thời gian chạy, và số liệu server.

Shell Plugin không bị giới hạn ở `/bin/sh`. Nó có thể chạy bất kỳ script bắt đầu bằng dòng shebang hợp lệ, gồm Node.js, Python, Perl, PHP, Ruby, Powershell, và hơn nữa.

Xem [Events](events.md), [Triggers](triggers.md), và [Plugins](plugins.md) để biết chi tiết đầy đủ.


## Hiểu JSON Qua STDIO

Shell Plugin là cách dễ nhất để bắt đầu vì nó có thể dùng exit code thông thường và output log thông thường. Nhưng nó cũng hỗ trợ đầy đủ [PTOps Wire Protocol](xywp.md), hay XYWP: JSON phân dòng qua STDIN và STDOUT.

Lúc job bắt đầu, PTOps gửi một tài liệu JSON gọn tới script của bạn qua STDIN. Nó bao gồm job ID, event ID, server đã chọn, parameter, input data, input file, và hơn nữa.

Script của bạn có thể viết message JSON gọn ra STDOUT. Mỗi message protocol nên bao gồm `"xy": 1`.

Đây là một script Shell Plugin viết bằng Node.js. Dòng shebang `#!/usr/bin/env node` báo cho Shell Plugin chạy nó bằng Node thay vì `/bin/sh`:

```js
#!/usr/bin/env node

// Đọc tài liệu JSON job duy nhất từ STDIN.
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
let job = JSON.parse( chunks.join('') );

// Báo cáo message trạng thái và progress khi job vẫn đang chạy.
console.log( JSON.stringify({
	xy: 1,
	progress: 0.25,
	status: "Reading job input..."
} ) );

// Đọc input người dùng truyền từ UI, API, workflow, hoặc job trước đó.
let name = (job.input && job.input.data && job.input.data.name) || "PTOps";

// Gửi output data tuỳ chỉnh. Cái này có thể được truyền cho job kế tiếp.
console.log( JSON.stringify({
	xy: 1,
	data: {
		greeting: "Hello, " + name + ".",
		sourceJob: job.id
	}
} ) );

// Cập nhật progress lần nữa.
console.log( JSON.stringify({
	xy: 1,
	progress: 0.75,
	status: "Finishing..."
} ) );

// Message cuối này hoàn tất job thành công.
// Gửi nó cuối cùng, vì PTOps coi bất kỳ message có "code" là cuối cùng.
console.log( JSON.stringify({
	xy: 1,
	code: 0,
	description: "Job completed successfully."
} ) );
```

Để báo lỗi, gửi một message cuối với code khác 0:

```json
{ "xy": 1, "code": 999, "description": "Failed to connect to the database." }
```

Các output message thường dùng:

| Bạn Muốn Gì | Ví Dụ |
|---------------|---------|
| Progress | `{ "xy": 1, "progress": 0.5 }` |
| Trạng thái trực tiếp | `{ "xy": 1, "status": "Processing records..." }` |
| Output data tuỳ chỉnh | `{ "xy": 1, "data": { "count": 42 } }` |
| Gắn output file | `{ "xy": 1, "files": [ "*.csv" ] }` |
| Thành công | `{ "xy": 1, "code": 0 }` |
| Lỗi | `{ "xy": 1, "code": 999, "description": "Something failed." }` |

Bất cứ thứ gì không được nhận diện là message XYWP sẽ được ghi lại thành output log thông thường. Ngoài ra, STDERR được ghi lại dưới dạng text thô, không phải JSON protocol.

Viết Event Plugin có thể tái sử dụng của riêng bạn cũng là một tuỳ chọn, nhưng bạn không cần bắt đầu từ đó. Event Plugin tuỳ chỉnh phù hợp nhất khi bạn muốn đóng gói thành phần có thể tái sử dụng, định nghĩa Plugin Parameter cho người viết event, hoặc chia sẻ một tích hợp hoàn chỉnh với người dùng PTOps khác.

Xem [PTOps Wire Protocol](xywp.md) và [Plugins](plugins.md#job-output) để biết protocol đầy đủ.

## Chuỗi Hai Event Không Cần Workflow

Bạn không cần workflow chỉ để chạy một event sau một event khác. Dùng action **Run Event**.

Tạo event thứ hai:

1. Mở **Events**.
2. Nhấn **New Event**.
3. Đặt tiêu đề là "Hello Followup".
4. Chọn **Shell Plugin**.
5. Dán script này:

```sh
#!/bin/sh

# Event này được khởi chạy bởi event đầu tiên.
echo "The followup event is running."

# Nếu job trước có output data, PTOps có thể truyền nó tiếp.
# Với script Shell Plugin đơn giản, bạn thường có thể bắt đầu bằng env var,
# plugin param, hoặc output log thuần trước khi viết plugin tuỳ chỉnh.

exit 0
```

6. Chọn server hoặc group đích.
7. Giữ trigger **Manual** mặc định được bật.
8. Lưu event.

Giờ chỉnh sửa event `Hello World` đầu tiên:

1. Mở phần **Actions**.
2. Thêm một action.
3. Đặt **Condition** thành "On Success".
4. Đặt **Type** thành "Run Event".
5. Chọn "Hello Followup" làm event sẽ chạy.
6. Lưu.

Chạy lại event "Hello World". Khi nó thành công, PTOps sẽ khởi chạy "Hello Followup".

Đây là cách đơn giản nhất để xây một chuỗi tuyến tính:

```text
Event A thành công -> action Run Event -> Event B chạy
```

Dùng mẫu này cho pipeline đơn giản. Chuyển sang workflow khi bạn cần phân nhánh trực quan, gộp (join), fan-out, hoặc luồng điều khiển phức tạp hơn.

Xem [Actions](actions.md#run-event) để biết mọi tuỳ chọn Run Event.

## Thêm Limit Concurrency Và Queue

Theo mặc định, nếu một job không thể bắt đầu vì event của nó đã đạt giới hạn concurrency, nó sẽ lỗi ngay với error. Bạn nên kết hợp **Max Concurrent Jobs** với **Max Queue Limit** khi muốn job vào hàng chờ.

Ví dụ, giả sử bạn muốn một event chỉ chạy một job tại một thời điểm, với tối đa 25 job đang chờ.

Chỉnh sửa event:

1. Mở trình chỉnh sửa event.
2. Mở phần **Limits**.
3. Thêm **Max Concurrent Jobs**.
4. Đặt amount thành `1`.
5. Thêm **Max Queue Limit**.
6. Đặt amount thành `25`.
7. Lưu.

Điều này có nghĩa là:

- Nếu không có job nào đang chạy, job mới bắt đầu.
- Nếu một job đã đang chạy, job mới chờ trong hàng chờ của event.
- Nếu 25 job đã đang chờ, lần khởi chạy tiếp theo bị từ chối.

Cặp limit này cũng quan trọng khi job có thể khởi chạy nhanh hơn worker của bạn có thể tiếp nhận, như trigger web hook, workflow repeat, workflow multiplex, hoặc schedule bận rộn.

Xem [Limits](limits.md#max-concurrent-jobs) và [Limits](limits.md#max-queue-limit) để biết hành vi đầy đủ.

## Bắn Web Hook Khi Job Lỗi

Web hook là các HTTP request gửi ra ngoài có thể tái sử dụng. Bạn tạo web hook một lần, sau đó gắn nó vào event hoặc alert bằng một action.

Trước tiên tạo một web hook:

1. Mở **Web Hooks**.
2. Nhấn **New Web Hook**.
3. Đặt tiêu đề, ví dụ "Ops Failure Hook".
4. Đặt method thành `POST`.
5. Đặt URL thành endpoint của bạn.
6. Thêm header `Content-Type: application/json`.
7. Dùng body JSON như thế này:

```json
{
	"text": "{{text}}",
	"job": "{{job.id}}",
	"event": "{{event.title}}",
	"code": "{{job.code}}",
	"description": "{{job.description}}",
	"url": "{{links.job_details}}"
}
```

Sau đó gắn nó vào một event:

1. Mở trình chỉnh sửa event.
2. Mở phần **Actions**.
3. Thêm một action.
4. Đặt **Condition** thành "On Any Error".
5. Đặt **Type** thành "Web Hook".
6. Chọn "Ops Failure Hook".
7. Lưu.

Để test, tạm thời đổi script Shell Plugin của bạn để lỗi:

```sh
#!/bin/sh

echo "This job is going to fail for testing."
exit 1
```

Chạy event. Job nên lỗi, và action web hook sẽ kích hoạt. Trang chi tiết job sẽ hiện hoạt động action và thông tin chẩn đoán web hook.

Xem [Web Hooks](webhooks.md) và [Actions](actions.md#web-hook) để biết về templating, secrets, retry, và khắc phục sự cố.

## Xây Dựng Một Workflow Nhỏ

Workflow là đồ thị trực quan. Chúng hữu ích khi automation cần được nhìn thấy và chỉnh sửa dưới dạng luồng.

Tạo một workflow nhỏ:

1. Mở **Workflows**.
2. Nhấn **New Workflow**.
3. Dùng node trigger **Manual** mặc định.
4. Thêm một node **Event**.
5. Chọn event "Hello World" của bạn.
6. Kết nối output của node trigger (bên phải) với input của node event (bên trái).
7. Thêm một node **Action**.
8. Chọn một action, ví dụ Web Hook hoặc Email.
9. Kết nối output của node event (bên phải) với node action (bên trái).
10. Nhấn vào wire từ node event tới node action và đặt condition, ví dụ "On Any Error" hoặc "On Success".
11. Lưu và chạy workflow.

Hình dạng cơ bản là:

```text
+----------------+     +-------------------+     +--------+
| Manual Trigger | --> | Hello World Event | --> | Action |
+----------------+     +-------------------+     +--------+
```

Nếu bạn gắn một node **Limit**, kết nối nó vào cực Nam (South pole) của node event. Ví dụ, gắn Max Concurrent Jobs và Max Queue Limit để kiểm soát fan-out.

Vài mẹo workflow:

- Wire mới từ node event và job mặc định nghĩa là "tiếp tục khi job này thành công", nhưng bạn có thể nhấn icon để đổi condition.
- Node event và job chạy song song theo mặc định nếu nhiều đường đang hoạt động.
- Node action không tiếp tục luồng. Chúng gắn một phản ứng vào node event hoặc job.
- Node limit không tiếp tục luồng. Chúng gắn rào chắn và/hoặc cấu hình vào node event hoặc job.
- Với chuỗi đơn giản "chạy B sau khi A thành công", một action Run Event có thể dễ hơn workflow.

Xem [Workflows](workflows.md) để biết loại node, wire condition, controller, và truyền dữ liệu.

## Bước Tiếp Theo

Khi phần cơ bản đã hoạt động, các tài liệu sau là điểm dừng tốt tiếp theo:

- [Self-Hosting](hosting.md): Cài đặt production, TLS, Docker Compose, storage, và setup multi-conductor.
- [Events](events.md): Mô hình event đầy đủ.
- [Triggers](triggers.md): Manual, schedule, interval, single-shot, incoming web hook, range, blackout window, và catch-up.
- [Actions](actions.md): Email, web hook, Run Event, channel, ticket, snapshot, và hơn nữa.
- [Limits](limits.md): Runtime limit, queueing, retry, concurrency, và giới hạn hàng ngày.
- [Workflows](workflows.md): Điều phối trực quan, controller, wire condition, và luồng dữ liệu.
- [PTOps Wire Protocol](xywp.md): Protocol JSON qua STDIO để viết plugin.
- [Plugins](plugins.md): Plugin có sẵn và phát triển plugin tuỳ chỉnh.

Bắt đầu nhỏ, cho một event chạy ổn định, sau đó thêm trigger, action, limit, và workflow khi automation của bạn phát triển.
