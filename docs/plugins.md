# Plugin

## Tổng Quan

Tài liệu này mô tả Hệ Thống Plugin của PTOps. Bạn có thể mở rộng tính năng của PTOps bằng cách thêm các Plugin, tự viết chúng (bằng bất kỳ ngôn ngữ nào!), hoặc tìm kiếm trên [Plugin Marketplace](marketplace.md).

## Các Loại Plugin

Dưới đây là các Loại Plugin khả dụng:

### Event Plugins

Event Plugins là loại Plugin chính trong PTOps, vì chúng thực sự là đoạn code để "chạy" các job. Khi event khởi chạy một job, dù là độc lập hay là một phần của workflow, tất cả chúng đều trỏ đến một Event Plugin cụ thể để thực thi mã nguồn cấu thành nên chính job đó. Event Plugins chạy trên server đích thực thi job, và được khởi chạy dưới dạng các tiến trình con từ xySat, agent từ xa của chúng tôi.

Một số Event Plugins tích hợp sẵn đi kèm với PTOps bao gồm:

| Tên Plugin | Mô tả |
|-------------|-------------|
| **[Shell Plugin](#shell-plugin)** | Shell Plugin cho phép bạn dễ dàng tạo các event thực thi mã shell tùy ý mà không cần tìm hiểu về Plugin API của PTOps. |
| **[HTTP Request Plugin](#http-request-plugin)** | HTTP Plugin có thể gửi các yêu cầu HTTP đến bất kỳ URL nào, hỗ trợ nhiều giao thức và tùy chọn khác nhau, bao gồm các header tùy chỉnh và nội dung body tùy chỉnh. |
| **[Test Plugin](#test-plugin)** | Test Plugin tồn tại chủ yếu để kiểm thử PTOps, nhưng nó cũng có thể hữu ích để kiểm thử các phần của workflow. Nó tạo ra dữ liệu mẫu và tùy chọn xuất ra một file mẫu để chuyển cho các event tiếp theo nếu được kết nối. |
| **[Fire Web Hook Plugin](#fire-web-hook-plugin)** | Fire Web Hook Plugin kích hoạt một trong những web hook đã cấu hình của PTOps dưới dạng một job tiêu chuẩn, nhờ đó workflow có thể rẽ nhánh hoặc thất bại dựa trên kết quả của web hook. |
| **[Docker Plugin](#docker-plugin)** | Docker Plugin cho phép bạn chạy các script tùy chỉnh bên trong một container Docker. Tương tự như [Shell Plugin](#shell-plugin), bạn có thể chỉ định bất kỳ đoạn code tùy chỉnh nào để chạy, bằng bất kỳ ngôn ngữ nào, miễn là nó hỗ trợ dòng [Shebang](https://en.wikipedia.org/wiki/Shebang_%28Unix%29). |

Để viết Event Plugin của riêng bạn, tất cả những gì bạn cần làm là cung cấp một tệp thực thi dòng lệnh, và cho nó đọc và ghi JSON qua [STDIN và STDOUT](https://en.wikipedia.org/wiki/Standard_streams). Thông tin về job hiện tại được truyền dưới dạng tài liệu JSON tới STDIN của bạn, và bạn có thể gửi lại các cập nhật tiến độ cùng các event hoàn thành một cách đơn giản bằng cách ghi JSON ra STDOUT của bạn.

Khi Plugin của bạn được thực thi trên server đích để chạy một job, một thư mục tạm thời duy nhất sẽ được tạo cho nó, và mọi file được chuyển đến job sẽ được tải xuống trước cho bạn. Thư mục làm việc hiện tại (CWD - current working directory) sẽ được đặt thành thư mục tạm này, nhờ đó Plugin của bạn có thể dễ dàng liệt kê và truy cập các file đầu vào.

Dưới đây là một ví dụ về Event Plugin sử dụng Node.js:

```js
// read job JSON from STDIN
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const job = JSON.parse( chunks.join('') );

console.log("Hello from plugin!");

// send progress updates
let percentage = 0;
setInterval( function() {
	percentage += 10;
	console.log( JSON.stringify({ xy: 1, progress: percentage / 100 }) );
	
	if (percentage >= 100) {
		console.log( JSON.stringify({ xy: 1, complete: true, code: 0 }) );
		process.exit(0);
	}
}, 1000 );
```

Bạn có thể viết Plugin bằng bất kỳ ngôn ngữ nào bạn muốn, miễn là nó hỗ trợ đọc/ghi JSON qua STDIO.

#### Event Parameters

Giống như hầu hết các loại Plugin khác, bạn có thể định nghĩa các tham số tùy chỉnh cho Event Plugins. Chúng có thể là các trường văn bản, hộp văn bản, trình biên tập code, menu chọn, hộp kiểm, hoặc bộ công cụ. Người dùng có thể điền các thông tin này khi họ chỉnh sửa event, và chúng sẽ được truyền tới Plugin khi job chạy. Xem [Tham Số Plugin](#tham-so-plugin) bên dưới để biết thêm chi tiết.

#### Job Input

Khi các Event Plugins được gọi thông qua việc khởi chạy một job, chúng được truyền một tài liệu JSON trên STDIN (được nén thành một dòng duy nhất). Các thuộc tính cấp cao nhất sau đây sẽ xuất hiện trong đối tượng:

| Tên Thuộc Tính | Loại | Mô Tả |
|---------------|------|-------------|
| `xy` | Number | Cho biết phiên bản [Giao thức Dây truyền tin PTOps (Wire Protocol)](xywp.md). Sẽ được đặt thành `1`. |
| `type` | String | Thuộc tính [Plugin.type](data.md#plugin-type), sẽ được đặt thành `event`. |
| `params` | Object | Nếu Plugin định nghĩa bất kỳ tham số nào, giá trị của chúng sẽ ở đây. |
| (Khác) | Nhiều loại | Tất cả các thuộc tính từ đối tượng [Job](data.md#job) được bao gồm ở đây. |

Dưới đây là một ví dụ tài liệu JSON được gửi đến STDIN của một Event Plugin như một phần của quá trình khởi chạy job:

```json
{
	"xy": 1,
	"type": "event",
	"targets": [
		"main"
	],
	"params": {
		"animal": "frog",
		"color": "green"
	},
	"input": {
		"data": { "foo": "bar" },
		"files": []
	},
	"fields": [],
	"limits": [],
	"actions": [],
	"notes": "",
	"category": "general",
	"plugin": "pmi11dqsxcy",
	"icon": "",
	"tags": [],
	"algo": "random",
	"username": "admin",
	"source": "user",
	"event": "emi11ejdlde",
	"id": "jmi11fqevei",
	"command": "node",
	"script": "console.log( JSON.stringify({ xy: 1, code: 0, description: \"Job successful!\" }) );\n",
	"uid": "",
	"gid": "",
	"kill": "parent",
	"env": {},
	"state": "active",
	"started": 1763256572.033,
	"now": 1763256572.024,
	"log_file_size": 0,
	"server": "smf4j79snhe",
	"groups": [
		"main"
	],
	"updated": 1763256572.033,
	"progress": 0,
	"cwd": "/opt/xyops/satellite/temp/jobs/jmi11fqevei",
	"log_file": "/opt/xyops/satellite/logs/jobs/job-jmi11fqevei.log",
	"pid": 1789701
}
```

Xem cấu trúc [Job](data.md#job) để biết thêm chi tiết về các thuộc tính này.

Lưu ý rằng tất cả các tham số Plugin cũng được truyền đến tiến trình Plugin của bạn dưới dạng các biến môi trường (với các ID được chuyển đổi nếu cần).

##### Input Files

Nếu job của bạn được truyền các file đầu vào (bởi một job trước đó, node workflow liên kết, hoặc do người dùng tải lên thủ công), chúng sẽ được cung cấp cho Event Plugin của bạn, và siêu dữ liệu (metadata) của file cũng được cung cấp kèm theo.

Đầu tiên, tất cả các file đầu vào của job được tự động ghi ra thư mục tạm duy nhất của job đó, đây cũng chính là thư mục làm việc hiện tại của plugin của bạn. Thư mục này sẽ trống *ngoại trừ* các file đầu vào, vì vậy bạn có thể sử dụng một [glob](https://en.wikipedia.org/wiki/Glob_%28programming%29) để liệt kê chúng. Tuy nhiên, danh sách các file cũng được cung cấp cho bạn thông qua đối tượng [Job.input](data.md#job-input), cụ thể là `input.files`. Ví dụ:

```json
"input": {
	"data": {},
	"files": [
		{
			"id": "fmktcdzp1skybhk9",
			"date": 1769321584,
			"filename": "mario.mp3",
			"size": 309425,
			"username": "admin"
		},
		{
			"id": "fmktcdzpasm25ncs",
			"date": 1769321584,
			"filename": "webb_2.jpg",
			"size": 1065694,
			"username": "admin"
		}
	]
}
```

Do đó, bạn cũng có thể khám phá và duyệt qua các file đầu vào của mình bằng cách truy cập cấu trúc dữ liệu này.

##### Biến Môi Trường

Khi các Event Plugins được gọi thông qua việc khởi chạy một job, chúng được truyền một tập hợp các biến môi trường. Chúng cung cấp một cách thuận tiện để đọc các tham số event và dữ liệu đầu vào mà không cần phải phân tích cú pháp JSON gửi tới STDIN. Dưới đây là danh sách các biến được cung cấp cho mỗi job đang chạy:

| Tên Biến | Mô Tả |
|---------------|-------------|
| `XYOPS` | Sẽ được đặt thành phiên bản xySat hiện tại. |
| `JOB_ID` | Sẽ chứa [Job.id](data.md#job-id) hiện tại. |
| `JOB_NOW` | Sẽ chứa [Job.now](data.md#job-now) hiện tại. |
| `JOB_BASE_URL` | Sẽ chứa [Job.base_url](data.md#job-base_url) hiện tại. |
| `data_*` | Tất cả các thuộc tính cấp cao nhất từ đối tượng [Job.input.data](data.md#job-input) được bao gồm dưới dạng các biến môi trường, với tiền tố `data_`. |
| `workflow_*` | Tất cả các [tham số workflow](data.md#jobworkflow-params) (trường người dùng) được bao gồm dưới dạng các biến môi trường, với tiền tố `workflow_`. |
| `workflow_data_*` | Tất cả các thuộc tính cấp cao nhất từ đối tượng [Job.workflowData](data.md#job-workflowdata) được bao gồm dưới dạng các biến môi trường, với tiền tố `workflow_data_`. |
| `server_data_*` | Tất cả các thuộc tính cấp cao nhất từ đối tượng [Job.serverData](data.md#job-serverdata) được bao gồm dưới dạng các biến môi trường, với tiền tố `server_data_`. |
| *(Event Param IDs)* | Tất cả các tham số event được truyền dưới dạng các biến môi trường với các ID tham số được sử dụng làm tên biến. |
| *(Secrets)* | Tất cả các biến [Secret Vault](secrets.md) được chỉ định đều được đưa vào dưới dạng các biến môi trường. |
| *(Job Env)* | Tất cả các thuộc tính từ đối tượng cấu hình toàn cục [job_env](config.md#job_env) được đưa vào dưới dạng các biến môi trường. |

#### Job Output

Plugin của bạn dự kiến sẽ ghi JSON ra STDOUT để báo cáo trạng thái lại cho conductor chính của PTOps. Ít nhất, bạn cần thông báo cho PTOps rằng job đã hoàn thành, và kết quả của job (tức là thành công hay thất bại). Việc này được thực hiện bằng cách in ra một đối tượng JSON với thuộc tính `xy` được đặt thành `1` (cho biết phiên bản [Giao thức Dây truyền tin PTOps](xywp.md)), và thuộc tính `code` được đặt thành `0` biểu thị thành công. Bạn cần đảm bảo JSON được nén thành một dòng duy nhất, và kết thúc bằng một ký tự xuống dòng EOL đơn (`\n` trên Unix). Ví dụ:

```json
{ "xy": 1, "code": 0 }
```

Điều này thông báo cho PTOps biết rằng job đã hoàn thành thành công, và tiến trình của bạn chuẩn bị thoát. Tuy nhiên, nếu job thất bại và bạn cần báo cáo lỗi, bạn cần đặt thuộc tính `code` thành bất kỳ mã lỗi khác không nào bạn muốn, và thêm thuộc tính `description` chứa một chuỗi thông báo lỗi tùy chỉnh. Đưa các thuộc tính này cùng với thuộc tính `xy` vào JSON. Ví dụ:

```json
{ "xy": 1, "code": 999, "description": "Failed to connect to database." }
```

Mã lỗi và phần mô tả của bạn sẽ được hiển thị trên trang Chi tiết Job trong UI, và trong bất kỳ thông báo email và/hoặc web hook nào được gửi đi khi event hoàn thành. Mã lỗi có thể là một số hoặc một chuỗi.

Nếu Plugin của bạn ghi bất kỳ nội dung nào khác ngoài JSON ra STDOUT (hoặc STDERR), hoặc nó bị thiếu thuộc tính `xy`, nội dung đó sẽ được tự động thêm vào file log của bạn dưới dạng văn bản thuần. Nhờ đó, bạn không phải lo lắng về việc sử dụng mã nguồn hoặc các tiện ích hiện có vốn có thể phát ra các định dạng JSON khác. PTOps rất linh hoạt về khía cạnh này.

Xin lưu ý rằng khi bạn gửi một dòng JSON chứa thuộc tính `code`, PTOps sẽ coi job của bạn đã hoàn thành, và *sẽ không xử lý thêm bất kỳ cập nhật JSON nào từ Plugin của bạn*. Vì vậy, hãy đảm bảo đó là dòng JSON **cuối cùng** bạn gửi cho một job.

##### Tiến Độ

Bên cạnh việc báo cáo thành công hay thất bại ở cuối job, bạn cũng có thể tùy chọn báo cáo tiến độ tại các khoảng thời gian tùy chỉnh trong khi job đang chạy. Từ đó, PTOps có thể hiển thị thanh đo tiến độ trực quan trong UI, cũng như tính toán thời gian còn lại ước tính. Để cập nhật tiến độ của một job, chỉ cần in một tài liệu JSON với thuộc tính `xy` được đặt thành `1`, và thuộc tính `progress` được đặt thành một số trong khoảng từ `0.0` đến `1.0`. Ví dụ:

```json
{ "xy": 1, "progress": 0.5 }
```

Điều này sẽ hiển thị tiến độ ở mức hoàn thành 50%, và tự động tính toán thời gian còn lại ước tính dựa trên khoảng thời gian chạy và tiến độ đạt được cho đến thời điểm đó. Bạn có thể lặp lại việc này thường xuyên tùy thích, với mức tiến độ chi tiết nhất bạn có thể cung cấp. Lưu ý rằng thời gian còn lại ước tính là một "dự đoán tốt nhất", và sẽ chính xác hơn nếu job của bạn tiến triển theo kiểu "tuyến tính", với các cập nhật tiến độ thường xuyên.

> [!IMPORTANT]
> Hãy lưu ý về hiện tượng đệm (buffering) đầu ra STDIO mà nhiều ngôn ngữ bật theo mặc định. Điều này có thể làm chậm trễ các cập nhật tiến độ của bạn (chưa kể đến các đầu ra khác), trừ khi bạn thiết lập tự động flush sau mỗi lần ghi. Hãy xem tài liệu ngôn ngữ cụ thể của bạn để biết chi tiết.

##### Trạng Thái

Bên cạnh việc [cho biết tiến độ job](#tien-do), bạn cũng có thể thiết lập một chuỗi "trạng thái" (status), vốn được hiển thị trên trang chi tiết job trực tiếp khi job đang chạy. Tương tự như chỉ báo tiến độ, bạn có thể cập nhật thông tin này thường xuyên tùy thích, ví dụ để báo cáo bạn đang ở giai đoạn nào của job. Để thiết lập trạng thái job, chỉ cần in một tài liệu JSON với thuộc tính `xy` được đặt thành `1`, và thuộc tính `status` được đặt thành bất kỳ chuỗi nào bạn muốn. Ví dụ:

```json
{ "xy": 1, "status": "Processing client report..." }
```

Bạn có thể kết hợp thuộc tính này với tiến độ (và bất kỳ cập nhật job nào khác):

```json
{ "xy": 1, "progress": 0.5, "status": "Processing file 34 of 68..." }
```

Lưu ý rằng chuỗi trạng thái *chỉ* được hiển thị khi job đang chạy trực tiếp, chứ không hiển thị sau khi job hoàn thành. Nó hiển thị ngay dưới thanh tiến độ, thay thế tiêu đề của hộp tóm tắt.

##### Số Liệu Hiệu Năng

Bạn có thể tùy chọn đưa các số liệu hiệu năng vào cuối job, chúng sẽ hiển thị dưới dạng một biểu đồ hình tròn trên trang Chi tiết Job. Các số liệu này có thể bao gồm bất kỳ danh mục nào bạn thích, và định dạng JSON là một đối tượng `perf` đơn giản nơi các giá trị đại diện cho lượng thời gian tiêu hao tính bằng giây. Ví dụ:

```json
{ "xy": 1, "perf": { "db": 18.51, "http": 3.22, "gzip": 0.84 } }
```

Các key perf có thể là bất kỳ thứ gì bạn muốn. Chúng chỉ là các danh mục tùy ý bạn tự tạo ra, đại diện cho việc Plugin của bạn đã tiêu tốn thời gian như thế nào trong suốt job.

PTOps chấp nhận một số định dạng khác nhau cho các số liệu hiệu năng, để thích ứng với các thư viện theo dõi hiệu năng khác nhau. Ví dụ: bạn có thể cung cấp số liệu ở định dạng query string, như thế này:

```json
{ "xy":1, "perf": "db=18.51&http=3.22&gzip=0.84" }
```

Nếu số liệu của bạn bao gồm một thuộc tính `total` (hoặc `t`) bên cạnh các số liệu khác, thuộc tính này được giả định đại diện cho tổng thời gian, và sẽ tự động được loại trừ khỏi biểu đồ hình tròn (nhưng được bao gồm trong biểu đồ lịch sử hiệu năng).

Nếu bạn theo dõi các số liệu bằng các đơn vị khác ngoài giây, bạn có thể cung cấp thuộc tính `scale`. Ví dụ: nếu tất cả số liệu của bạn đều tính bằng mili giây, chỉ cần đặt thuộc tính `scale` thành `1000`. Ví dụ:

```json
{ "xy": 1, "perf": { "scale": 1000, "db": 1851, "http": 3220, "gzip": 840 } }
```

Định dạng hơi phức tạp hơn một chút được tạo ra bởi thư viện [pixl-perf](https://www.npmjs.com/package/pixl-perf) của riêng chúng tôi cũng được hỗ trợ.

##### Nội Dung Tùy Chỉnh

Nếu Plugin của bạn tạo ra các số liệu thống kê hoặc dữ liệu dạng bảng khác, bạn có thể để PTOps render nội dung này thành một bảng trên trang Chi tiết Job. Bạn có thể thực hiện việc này trong hoặc vào cuối một lượt chạy job. Chỉ cần in một đối tượng JSON với thuộc tính có tên là `table`, chứa các key sau:

| Tên Thuộc Tính | Mô tả |
|---------------|-------------|
| `title` | Tiêu đề tùy chọn hiển thị phía trên bảng, mặc định là "Job Data Table". |
| `header` | Mảng tùy chọn các cột tiêu đề, hiển thị dạng in đậm có bóng phía trên các dòng dữ liệu chính. |
| `rows` | **Bắt buộc** mảng các hàng, với mỗi hàng là một mảng bên trong chứa các giá trị cột. |
| `caption` | Chú thích tùy chọn hiển thị dưới bảng (văn bản màu xám nhỏ, căn giữa). |

Dưới đây là một ví dụ bảng dữ liệu. Lưu ý rằng bảng này đã được mở rộng để phục vụ mục đích tài liệu, nhưng trong thực tế JSON của bạn cần được nén trên một dòng duy nhất khi in ra STDOUT.

```json
{
	"xy": 1,
	"table": {
		"title": "Sample Job Stats",
		"header": [
			"IP Address", "DNS Lookup", "Flag", "Count", "Percentage"
		],
		"rows": [
			["62.121.210.2", "directing.com", "MaxEvents-ImpsUserHour-DMZ", 138, "0.0032%" ],
			["97.247.105.50", "hsd2.nm.comcast.net", "MaxEvents-ImpsUserHour-ILUA", 84, "0.0019%" ],
			["21.153.110.51", "grandnetworks.net", "InvalidIP-Basic", 20, "0.00046%" ],
			["95.224.240.69", "hsd6.mi.comcast.net", "MaxEvents-ImpsUserHour-NM", 19, "0.00044%" ],
			["72.129.60.245", "hsd6.nm.comcast.net", "InvalidCat-Domestic", 17, "0.00039%" ],
			["21.239.78.116", "cable.mindsprung.com", "InvalidDog-Exotic", 15, "0.00037%" ],
			["172.24.147.27", "cliento.mchsi.com", "MaxEvents-ClicksPer", 14, "0.00035%" ],
			["60.203.211.33", "rgv.res.com", "InvalidFrog-Croak", 14, "0.00030%" ],
			["24.8.8.129", "dsl.att.com", "Pizza-Hawaiian", 12, "0.00025%" ],
			["255.255.1.1", "favoriteisp.com", "Random-Data", 10, "0%" ]
		],
		"caption": "This is an example stats table you can generate from within your Plugin code."
	}
}
```

Nếu bạn muốn tạo nội dung HTML tùy chỉnh của riêng mình từ mã Plugin, và hiển thị nó trong trang Chi tiết Job, bạn cũng có thể làm được điều đó. Chỉ cần in một đối tượng JSON với thuộc tính có tên là `html`, chứa các key sau:

| Tên Thuộc Tính | Mô tả |
|---------------|-------------|
| `title` | Tiêu đề tùy chọn hiển thị phía trên phần nội dung, mặc định là "Job Custom Data". |
| `content` | **Bắt buộc** Nội dung HTML thô để render vào trang. |
| `caption` | Chú thích tùy chọn hiển thị dưới phần HTML của bạn (văn bản màu xám nhỏ, căn giữa). |

Dưới đây là một ví dụ báo cáo HTML. Lưu ý rằng báo cáo này đã được mở rộng để phục vụ mục đích tài liệu, nhưng trong thực tế JSON của bạn cần được nén trên một dòng duy nhất khi in ra STDOUT.

```json
{
	"xy": 1,
	"html": {
		"title": "Sample Job Report",
		"content": "This is <b>HTML</b> so you can use <i>styling</i> and such.",
		"caption": "This is a caption displayed under your HTML content."
	}
}
```

Lưu ý rằng chỉ các phần tử HTML cơ bản được phép ở đây nhằm ngăn chặn các cuộc tấn công XSS. Xem `sanitize_html_config` trong file `/opt/xyops/internal/ui.json` để biết danh sách đầy đủ các tag được cho phép.

Nếu Plugin của bạn tạo ra văn bản thuần (plain text) thay vì HTML, bạn có thể đổi thuộc tính `html` thành `text`, việc này sẽ bảo toàn định dạng như khoảng trắng. Ví dụ:

```json
{
	"xy": 1,
	"text": {
		"title": "Sample Text Report",
		"content": "This is plain text, so no styling allowed here.",
		"caption": "This is a caption displayed under your text content."
	}
}
```

Tương tự, nếu Plugin của bạn tạo ra định dạng markdown, bạn có thể đưa nó vào thay vì HTML hoặc text:

```json
{
	"xy": 1,
	"markdown": {
		"title": "Sample Markdown Report",
		"content": "This is **Markdown** so you can use *styling*, [links](https://xyops.io) and such.",
		"caption": "This is a caption displayed under your Markdown content."
	}
}
```

Lưu ý rằng chỉ một trong số các loại đầu ra `html`, `text` hoặc `markdown` được phép cho mỗi job (text và markdown được render lại thành HTML).

##### Nhãn Job

Bạn có thể tùy chọn thêm các nhãn tùy chỉnh vào các job của mình, chúng sẽ được hiển thị trên các trang lịch sử job đã hoàn thành bên cạnh các Job ID. Điều này hữu ích nếu bạn khởi chạy các job với các tham số tùy chỉnh, và cần phân biệt chúng trong danh sách đã hoàn thành.

Để thiết lập nhãn cho một job, chỉ cần đưa một thuộc tính `label` vào JSON đầu ra của Plugin của bạn, được đặt thành bất kỳ chuỗi nào bạn muốn. Ví dụ:

```json
{ "xy": 1, "label": "Reindex Database" }
```

Điều này sẽ khiến nhãn "Reindex Database" hiển thị bên cạnh Job ID.

##### Dữ Liệu Đầu Ra

Để đưa đầu ra dữ liệu tùy ý từ job của bạn, vốn sẽ được chuyển tự động tới job tiếp theo (qua kết nối node workflow hoặc action run event), hãy sử dụng định dạng tin nhắn này:

```json
{
	"xy": 1,
	"data": {
		"text": "This is some sample data to pass to the next job!",
		"hostname": "raspberrypi",
		"pid": 13094,
		"random": 0.54,
		"obj": { "foo": 1, "bar": null, "bool": true }
	}
}
```

Định dạng của đối tượng `data` là tự do, và có thể chứa bất kỳ nội dung nào bạn muốn. Lưu ý rằng ví dụ trên được in đẹp để hiển thị, nhưng trong thực tế tất cả các tin nhắn phải được gửi dưới dạng các dòng đơn, vì vậy hãy nhớ nén JSON của bạn khi tuần tự hóa (serialize) nó.

Lưu ý rằng nếu bạn gửi nhiều tin nhắn chứa `data` trong cùng một job, các thuộc tính của đối tượng data cấp cao nhất sẽ được shallow-merge (trộn nông - giá trị sau sẽ ghi đè lên giá trị trước đối với các key bị trùng). Sử dụng tính năng này, bạn có thể thêm dữ liệu dần dần trong suốt quá trình chạy job. Ngoài ra, nếu bạn ghi đè lên một mảng cấp cao nhất bằng một mảng khác, nó sẽ được *nối tiếp* (concatenate) thay vì bị thay thế. Ví dụ:

```json
{ "xy": 1, "data": { "arr": [0, 1, 2] } }
```

Sau đó, trong cùng job đó:

```json
{ "xy": 1, "data": { "arr": [3, 4, 5] } }
```

Điều này sẽ dẫn đến kết quả `[0, 1, 2, 3, 4, 5]` trong mảng dữ liệu `arr` cuối cùng khi job hoàn thành.

##### File Đầu Ra

Để tải lên các file như một phần đầu ra job của bạn, bạn chỉ cần báo cho PTOps biết chúng nằm ở đâu trên đĩa. Khi job của bạn hoàn thành, các file sẽ được đính kèm và tải lên cùng với dữ liệu job, và hiển thị trong UI. Chúng cũng sẽ được chuyển đến job tiếp theo nếu có (qua kết nối node workflow hoặc action run event). Dưới đây là một ví dụ:

```json
{
	"xy": 1,
	"files": [
		"/path/to/file1.txt",
		"/path/to/file2.mp4"
	]
}
```

Bạn không nhất thiết phải đặt tên cụ thể cho từng file. Thay vào đó, bạn có thể chỉ định một ký tự đại diện (glob pattern) vốn có thể khớp với nhiều file:

```json
{
	"xy": 1,
	"files": [ "/path/to/*.mp4" ]
}
```

Nếu các file nằm trong thư mục làm việc hiện tại (thư mục tạm duy nhất của job của bạn), bạn có thể bỏ qua đường dẫn dẫn đầu và chỉ cần đưa vào (các) tên file:

```json
{
	"xy": 1,
	"files": [ "*.mp4" ]
}
```

Nếu bạn muốn PTOps xóa các file cho bạn sau khi tải lên, hãy chỉ định một đối tượng bên trong mảng files, chứa các thuộc tính `path` và `delete`. Ví dụ:

```json
{
	"xy": 1,
	"files": [
		{ "path": "*.mp4", "delete": true }
	]
}
```

Lưu ý rằng nếu bạn gửi nhiều tin nhắn có thuộc tính `files`, danh sách trước đó sẽ bị ghi đè (tức là giá trị sau sẽ thắng).

##### Tag

Để **thêm** các tag vào job hiện tại, hãy sử dụng định dạng tin nhắn "push" sau:

```json
{
	"xy": 1,
	"push": {
		"tags": ["tag1", "tag2"]
	}
}
```

Đối tượng `push` được sử dụng ở đây để chỉ thị cho PTOps "push" (thêm vào cuối) các tag vào tập hợp hiện có (bạn không thể thay thế hoặc xóa các tag). Bản thân các tag phải là các [Tag.id](data.md#tag-id) hợp lệ, và các tag trùng lặp sẽ tự động bị loại bỏ.

##### Action

Để **thêm** các action vào job hiện tại, hãy sử dụng định dạng tin nhắn "push" sau. Ví dụ này sẽ gửi một email tới một địa chỉ cụ thể khi job hoàn thành:

```json
{
	"xy": 1,
	"push": {
		"actions": [
			{ "condition": "complete", "type": "email", "email": "admin@mycompany.com", "enabled": true }
		]
	}
}
```

Dưới đây là một ví dụ khác sẽ khởi chạy một job tiếp theo khi job hiện tại hoàn thành thành công:

```json
{
	"xy": 1,
	"push": {
		"actions": [
			{ "condition": "success", "type": "run_event", "event_id": "emi2d3f42zy", "params": {}, "enabled": true }
		]
	}
}
```

Đối tượng `push` được sử dụng ở đây để chỉ thị cho PTOps "push" (thêm vào cuối) các action vào tập hợp hiện có (bạn không thể thay thế hoặc xóa các action). Xem [Các Loại Action](actions.md#các-loại-action) để biết tất cả các đối tượng action khả thi bạn có thể thêm ở đây.

##### Dữ Liệu Server

Để cập nhật [Dữ Liệu Người Dùng Server](servers.md#user-data) cho server hiện tại từ bên trong một job đang chạy, hãy sử dụng định dạng đầu ra sau:

```json
{
	"xy": 1,
	"serverData": {
		"foo": "bar"
	}
}
```

Lưu ý rằng dữ liệu server được trộn nông (shallow-merged), vì vậy bạn có thể chỉ định một đối tượng chứa ít thuộc tính và nó sẽ chỉ thêm / thay thế các thuộc tính cấp cao nhất được đưa vào. Nếu job của bạn xuất ra nhiều tin nhắn chứa `serverData`, tất cả chúng sẽ được shallow-merge lại với nhau (giá trị sau sẽ ghi đè lên các key trùng lặp).

Dữ liệu người dùng của server chỉ được cập nhật khi job hoàn thành. Nếu bạn cần cập nhật dữ liệu server *ngay lập tức* trong suốt job, hãy sử dụng API [update_server_data](api.md#update_server_data) thay thế.

##### Dữ Liệu Workflow

Để cập nhật [Dữ Liệu Workflow](workflows.md#sharing-data-between-all-nodes) cho workflow hiện tại từ bên trong một job đang chạy, hãy sử dụng định dạng đầu ra sau:

```json
{
	"xy": 1,
	"workflowData": {
		"foo": "bar"
	}
}
```

Lưu ý rằng dữ liệu workflow được trộn nông (shallow-merged), vì vậy bạn có thể chỉ định một đối tượng chứa ít thuộc tính và nó sẽ chỉ thêm / thay thế các thuộc tính cấp cao nhất được đưa vào. Nếu job của bạn xuất ra nhiều tin nhắn chứa `workflowData`, tất cả chúng sẽ được shallow-merge lại với nhau. Ngoài ra, các mảng cấp cao nhất được nối tiếp khi merge.

Dữ liệu workflow chỉ được cập nhật trong workflow cha khi sub-job hoàn thành.

### Action Plugins

Action Plugins được thiết kế cho các hành động tùy chỉnh diễn ra để phản hồi các job đang bắt đầu, hoàn thành, hoặc hoàn thành với các mã kết quả cụ thể (ví dụ: thành công, lỗi, cảnh báo, nghiêm trọng, v.v.). Chúng cũng có thể chạy để phản hồi các alert đang kích hoạt hoặc đang xóa bỏ. Bạn đã có thể gán một số [action tích hợp sẵn](actions.md) bao gồm gửi email, kích hoạt web hook, khởi chạy event, chụp snapshot server, v.v. Nhưng với các Plugin, bạn có thể tự viết các action của riêng mình để làm bất kỳ điều gì bạn muốn. Chúng thậm chí có thể được cấu hình để chấp nhận một tập hợp các tham số tùy chỉnh do người dùng cấu hình trong UI.

Action Plugins chạy *trên server conductor chính*, vì chúng là một phần của engine cốt lõi. Tuy nhiên, bạn vẫn có thể viết chúng bằng bất kỳ ngôn ngữ nào, vì chúng được sinh ra dưới dạng các tiến trình con phụ (subprocesses), và API truyền thông là JSON qua STDIO. Để tạo một Action Plugin, hãy điều hướng đến trang **Plugins**, và nhấp vào nút **New Plugin**. Đối với loại Plugin, chọn "Action Plugin".

#### Action Parameters

Giống như hầu hết các loại Plugin khác, bạn có thể định nghĩa các tham số tùy chỉnh cho Action Plugins. Chúng có thể là các trường văn bản, hộp văn bản, trình biên tập code, menu chọn, hộp kiểm, hoặc bộ công cụ. Người dùng có thể điền thông tin này khi họ chỉnh sửa event hoặc alert, và chúng sẽ được truyền tới Plugin khi action kích hoạt. Xem [Tham Số Plugin](#tham-so-plugin) bên dưới để biết thêm chi tiết.

#### Action Input

Khi các Action Plugins được gọi, chúng được truyền một tài liệu JSON trên STDIN (được nén thành một dòng duy nhất). Các thuộc tính cấp cao nhất sau đây sẽ xuất hiện trong đối tượng:

| Tên Thuộc Tính | Loại | Mô Tả |
|---------------|------|-------------|
| `xy` | Number | Cho biết phiên bản [Giao thức Dây truyền tin PTOps](xywp.md). Sẽ được đặt thành `1`. |
| `type` | String | Thuộc tính [Plugin.type](data.md#plugin-type), sẽ được đặt thành `action`. |
| `condition` | String | Thuộc tính [Action.condition](data.md#action-condition) đã kích hoạt Plugin. |
| `params` | Object | Nếu Plugin định nghĩa bất kỳ tham số nào, giá trị của chúng sẽ ở đây. |
| `secrets` | Object | Nếu Plugin được gán bất kỳ [Secret](secrets.md) nào, chúng sẽ được bao gồm ở đây (cũng như trong các biến môi trường). |
| `base_url` | String | Một localhost base URL được cung cấp trong trường hợp Plugin của bạn cần thực hiện bất kỳ lệnh gọi API nào tới PTOps. |
| (Khác) | Nhiều loại | Dựa trên ngữ cảnh; xem bên dưới. |

Nếu Action Plugin đang được gọi trong ngữ cảnh liên quan đến job (tức là khi job bắt đầu, job hoàn thành, hoặc các action khác của job), nội dung của [JobHookData](data.md#jobhookdata) cũng sẽ được merge ở cấp cao nhất. Tương tự, nếu plugin đang được gọi trong ngữ cảnh liên quan đến alert (alert được kích hoạt hoặc xóa bỏ), thì nội dung của [AlertHookData](data.md#alerthookdata) sẽ được merge.

Dưới đây là một ví dụ tài liệu JSON được gửi đến STDIN của một Action Plugin như một phần của quá trình hoàn thành job:

```json
{
	"xy": 1,
	"type": "action",
	"condition": "success",
	"params": {
		"foo": "Baz"
	},
	"secrets": {
		"DB_USER": "dev",
		"DB_PASS": "1234"
	},
	"base_url": "http://localhost:5522",
	"job": {
		"id": "jmhzaot10tm",
		"complete": true,
		"code": 0,
		"description": "",
		"completed": 1763151180.219,
		"elapsed": 0.701
	},
	"action": {
		"type": "plugin",
		"condition": "success",
		"plugin_id": "pmhzan6voso"
	},
	"event": {
		"id": "emhzaoispta"
	},
	"plugin": {
		"id": "shellplug"
	},
	"category": {
		"id": "general"
	},
	"server": {
		"id": "smf4j79snhe"
	},
	"nice_server": "raspberrypi",
	"nice_hostname": "raspberrypi",
	"links": {
		"job_details": "https://local.xyops.io:5523/#Job?id=jmhzaot10tm",
		"job_log": "https://local.xyops.io:5523/api/app/download_job_log?id=jmhzaot10tm&t=lnJY9P2-VTuqNIlV7jReuw",
		"job_files": "(None)"
	},
	"display": {
		"elapsed": "0 seconds",
		"log_size": "23 bytes",
		"perf": "(No metrics provided)",
		"mem": "47.4 MB (Peak: 47.4 MB)",
		"cpu": "28% (Peak: 28%)"
	},
	"text": "PTOps Job completed successfully on raspberrypi: Run Custom Action: https://local.xyops.io:5523/#Job?id=jmhzaot10tm"
}
```

Xem [JobHookData](data.md#jobhookdata) để biết thêm chi tiết về các thuộc tính này.

Và đây là một ví dụ tài liệu JSON được gửi đến STDIN của một Action Plugin như một phần của việc kích hoạt alert mới:

```json
{
	"xy": 1,
	"type": "action",
	"condition": "alert_new",
	"alert_def": {
		"id": "active_jobs_high"
	},
	"params": {
		"foo": "Foosball"
	},
	"secrets": {},
	"base_url": "http://localhost:5522",
	"server": {
		"id": "smf4j79snhe"
	},
	"alert": {
		"id": "amhzbmb6jhw",
		"exp": "monitors.active_jobs >= 1",
		"message": "Active job count is too high: 1"
	},
	"active_jobs": [
		{
			"id": "jmhzblxlvhl",
			"event": "emfetc6wcpw"
		}
	],
	"date_time": "Fri Nov 14 2025 12:39:02 GMT-0800 (Pacific Standard Time)",
	"nice_groups": "Main Group",
	"nice_load_avg": 0.02,
	"nice_mem_total": "906.2 MB",
	"nice_mem_avail": "624.4 MB",
	"nice_uptime": "91 days",
	"nice_cpu": "Sony UK BCM2837 (arm64)",
	"nice_os": "Debian GNU/Linux 12",
	"nice_notes": "(None)",
	"nice_hostname": "raspberrypi",
	"nice_ip": "10.1.10.92",
	"nice_server": "raspberrypi",
	"nice_active_jobs": "- [Job #jmhzblxlvhl](https://local.xyops.io:5523/#Job?id=jmhzblxlvhl) (Convert Video Format)\n",
	"links": {
		"server_url": "https://local.xyops.io:5523/#Server?id=smf4j79snhe",
		"alert_url": "https://local.xyops.io:5523/#Alerts?id=amhzbmb6jhw"
	},
	"text": "PTOps Alert: raspberrypi: High Active Jobs: n/a: https://local.xyops.io:5523/#Alerts?id=amhzbmb6jhw"
}
```

Xem [AlertHookData](data.md#alerthookdata) để biết thêm chi tiết về các thuộc tính này.

#### Action Output

Khi Action Plugin của bạn hoàn thành, bạn có thể thông báo cho PTOps về kết quả (thành công hay thất bại), và bất kỳ chi tiết bổ sung nào bạn muốn thêm. Việc này được thực hiện bằng cách gửi một bản ghi JSON ra STDOUT của tiến trình. Tương tự như tài liệu bạn nhận được qua STDIN, nó cần có một thuộc tính `xy` cấp cao nhất được đặt thành `1`, một thuộc tính `code` cho biết thành công hay thất bại, và một thuộc tính `description` tùy chọn:

```json
{
	"xy": 1,
	"code": 0,
	"description": "Action success!"
}
```

Như các API khác của PTOps, mã `0` hoặc `false` biểu thị thành công, trong khi bất kỳ giá trị nào khác đều có nghĩa là đã xảy ra lỗi. Bạn có thể sử dụng thuộc tính `description` để chuyển tiếp một thông báo thành công hoặc lỗi tùy chọn. Tất cả thông tin này sẽ được lưu trữ cùng với job hoặc alert, và hiển thị trong PTOps UI.

Mẹo nâng cao: bạn cũng có thể đưa vào thuộc tính `details` tùy chọn, thuộc tính này sẽ được render dưới dạng Markdown trong hộp thoại chi tiết cho action. Điều này hữu ích nếu action của bạn tạo ra lượng lớn output hoặc log mà bạn muốn ghi lại và hiển thị cho người dùng.

Nếu Plugin của bạn không xuất ra JSON thì cũng không sao. Khi không có JSON nào được phát hiện trong luồng output, PTOps sẽ giả định thành công hay thất bại dựa trên mã thoát (exit code) của tiến trình, và hiển thị output thô dưới dạng văn bản thuần nếu có.

### Trigger Plugins

Trigger Plugins là các phần mở rộng của hệ thống scheduler, theo nghĩa là chúng có thể quyết định "khi nào" và "liệu có" khởi chạy các job. Cụ thể, nếu một event sử dụng một trigger plugin, nó sẽ được tham vấn *mỗi lượt chạy một job được lập lịch*, và Plugin sẽ quyết định có khởi chạy từng job được chỉ định hay không. Ví dụ: thuộc tính này có thể được sử dụng cho các thuật toán định thời tùy chỉnh như bình minh / hoàng hôn, hoặc thậm chí theo dõi một thư mục hoặc tiền tố S3 để chờ các file mới xuất hiện.

Đây là một trigger kiểu "bổ nghĩa" (modifier), vì vậy nó cần được cấu hình kết hợp với một trigger schedule tiêu chuẩn. Lịch trình sẽ thiết lập chu kỳ và tần suất khi Plugin được khởi chạy.

Trigger Plugins chạy *trên server conductor chính*, vì chúng thực thi trước khi một job được khởi chạy và trước khi một server được chọn cho job đó. Tuy nhiên, tương tự như các loại Plugin khác, chúng được sinh ra dưới dạng các tiến trình con và có thể được viết bằng hầu hết mọi ngôn ngữ. Không có SDK nào cần sử dụng -- PTOps giao tiếp với các Plugin qua định dạng JSON đơn giản trên STDIO.

Để tạo một Trigger Plugin, hãy điều hướng đến trang **Plugins**, và nhấp vào nút **New Plugin**. Đối với loại Plugin, chọn "Trigger Plugin".

#### Trigger Parameters

Giống như hầu hết các loại Plugin khác, bạn có thể định nghĩa các tham số tùy chỉnh cho Trigger Plugins. Chúng có thể là các trường văn bản, hộp văn bản, trình biên tập code, menu chọn hoặc hộp kiểm. Người dùng có thể điền thông tin này khi họ chỉnh sửa event, và chúng sẽ được truyền tới Plugin khi quyết định chạy các job cho event đó.

#### Trigger Input

Khi trigger plugin của bạn được gọi, nó sẽ được truyền một mảng chứa tất cả các event đang chờ quyết định khởi chạy (tức là tất cả các event đã thêm trigger plugin của bạn vào đó). Một dòng JSON duy nhất sẽ được chuyển đến tiến trình plugin của bạn qua STDIN, trông tương tự như thế này (được in đẹp để phục vụ mục đích hiển thị):

```json
{
	"xy": 1,
	"type": "trigger",
	"items": [
		{
			"timezone": "America/Los_Angeles", 
			"now": 1757642510, 
			"dargs": {
				"year": 2022, 
				"month": 11, 
				"day": 29, 
				"rday": -3,
				"weekday": 2, 
				"hour": 22, 
				"minute": 29
			}, 
			"params": {
				"longitude": -118.2437,
				"latitude": 34.0522
			}, 
			"job": {
				"id": "emdy0mg1oum",
				"title": "Convert Video Format",
				"enabled": true,
				"username": "admin",
				"modified": 1726463348,
				"created": 1726463348,
				"category": "cat2",
				"targets": [
					"main"
				],
				"algo": "random",
				"notes": ""
			}
		}
	],
	"secrets": {},
	"active_jobs": [],
	"base_url": "http://localhost:5522"
}
```

Giống như tất cả các hoạt động giao tiếp STDIO của PTOps, JSON sẽ luôn có một thuộc tính `xy` cấp cao nhất được đặt thành `1` (phiên bản [Giao thức Dây truyền tin PTOps](xywp.md)), và một thuộc tính `type` được đặt thành `trigger`. Dưới đây là danh sách đầy đủ các thuộc tính cấp cao nhất bạn có thể mong đợi:

| Tên Thuộc Tính | Loại | Mô Tả |
|---------------|------|-------------|
| `xy` | Number | Phiên bản [Giao thức Dây truyền tin PTOps](xywp.md). |
| `type` | String | Sẽ luôn được đặt thành `trigger` cho các payload của Trigger Plugin. |
| `items` | Array | Mảng chứa các event được lập lịch để plugin xử lý. Xem chi tiết bên dưới. |
| `secrets` | Object | Nếu plugin của bạn được gán bất kỳ secret nào, chúng sẽ được chuyển trong đối tượng này (và cũng dưới dạng các biến môi trường). |
| `active_jobs` | Array | Mảng chứa tất cả các [Job](data.md#job) đang hoạt động hiện tại. |
| `base_url` | String | Một localhost base URL được cung cấp trong trường hợp Plugin của bạn cần thực hiện bất kỳ cuộc gọi API nào tới PTOps. |

Mảng `items` sẽ chứa một phần tử cho mỗi event được lập lịch khởi chạy, và có plugin được gán làm trigger. Quyết định xem mỗi event có thực sự khởi chạy một job hay không là tùy thuộc vào mã nguồn plugin của bạn. Bạn cũng được cung cấp một số thông tin khác về từng event:

| Tên Thuộc Tính | Loại | Mô Tả |
|---------------|------|-------------|
| `timezone` | String | Múi giờ hiện tại được chọn cho event. |
| `now` | Number | Thời gian hiện tại cho lần khởi chạy job tiềm năng tính bằng Epoch giây. Lưu ý rằng thời gian này có thể ở quá khứ nếu PTOps đang thực hiện chạy bù các event bị lỡ. |
| `dargs` | Object | Ngày/giờ hiện tại cho lần khởi chạy job, được phân tách thành các phần tử số riêng lẻ, theo múi giờ của event. Xem chi tiết bên dưới. |
| `params` | Object | Đối tượng này chứa các tham số tùy chỉnh của riêng plugin của bạn, được người dùng điền ở cấp độ event. |
| `job` | Object | Bản sao của đối tượng [Event](data.md#event) vốn sẽ được sử dụng để khởi chạy job nếu plugin của bạn quyết định chạy nó. |

Dưới đây là mô tả của tất cả các thuộc tính ngày/giờ `dargs`:

| Tên Thuộc Tính | Loại | Mô Tả |
|---------------|------|-------------|
| `year` | Number | Năm dạng số nguyên, ví dụ: `2025`. |
| `month` | Number | Số tháng từ `1` đến `12`. |
| `day` | Number | Ngày trong tháng từ `1` đến `31`. |
| `rday` | Number | Ngày trong tháng tính ngược (ví dụ ngày cuối cùng của tháng sẽ là `-1`, ngày sát cuối sẽ là `-2`, v.v.). |
| `weekday` | Number | Một số đại diện cho ngày trong tuần, từ `0` (Chủ Nhật) đến `6` (Thứ Bảy). |
| `hour` | Number | Giờ ở định dạng 24 giờ (từ `0` đến `23`). |
| `minute` | Number | Số phút từ `0` đến `59`. |

JSON sẽ được cung cấp cho plugin của bạn dưới dạng một dòng duy nhất trên STDIN. Bạn sẽ cần đọc và phân tích cú pháp JSON để duyệt qua mảng `items`. Dưới đây là một ví dụ bằng Node.js (nhưng bạn có thể sử dụng bất kỳ ngôn ngữ nào mình muốn):

```js
// read JSON from STDIN
const chunks = [];
for await (const chunk of process.stdin) { chunks.push(chunk); }
const data = JSON.parse( chunks.join('') );

data.items.forEach( function(item) {
	// do something with item...
} );
```

#### Trigger Output

Khi plugin của bạn quyết định event nào nên khởi chạy job (nếu có), bạn cần truyền thông tin đó ngược lại cho PTOps. Việc này được thực hiện bằng cách gửi một bản ghi JSON ra STDOUT của tiến trình. Tương tự như tài liệu bạn nhận được qua STDIN, nó cần có một thuộc tính `xy` cấp cao nhất được đặt thành `1`, và một mảng `items`:

```json
{
	"xy": 1,
	"items": [ false, false, true ]
}
```

Mảng `items` cần có số lượng phần tử tương tự như mảng ban đầu bạn nhận được, và mỗi phần tử có thể được đặt thành một giá trị Boolean đơn giản như hiển thị ở trên. Trong trường hợp này, `true` nghĩa là khởi chạy một job cho event, và `false` nghĩa là không chạy. Mỗi mục trong mảng đầu ra của bạn cần khớp hàng với đối tượng tương ứng trong mảng đầu vào thông qua chỉ số (index) của chúng.

Thay vì một Boolean đơn giản, các phần tử cũng có thể là các đối tượng chứa thuộc tính Boolean `launch` (cho biết có khởi chạy job hay không). Định dạng dài chi tiết thay thế này tồn tại để bạn có thể đưa vào siêu dữ liệu bổ sung cho các job được khởi chạy. Ví dụ:

```json
{
	"xy": 1,
	"items": [ 
		{
			"launch": false
		},
		{
			"launch": false
		},
		{
			"launch": true,
			"data": { "mykey1": "myvalue1" },
			"files": [ "/path/to/file.txt" ]
		}
	]
}
```

Thực tế, thay vì xây dựng một mảng `items` mới cho đầu ra, việc bạn có thể làm là sửa đổi trực tiếp mảng `items` hiện có nhận được qua STDIN (tức là chỉ cần thêm `launch` và các thuộc tính khác trực tiếp vào đó), và sau đó echo đối tượng đã sửa đổi ngược lại qua STDOUT. Để minh họa điều này, dưới đây là một ví dụ vui hiển thị việc khởi chạy ngẫu nhiên các job dựa trên xác suất 50%:

```js
// read JSON from STDIN
const chunks = [];
for await (const chunk of process.stdin) { chunks.push(chunk); }
const data = JSON.parse( chunks.join('') );

data.items.forEach( function(item) {
	// randomly launch a job or not (silly example)
	item.launch = Math.random() < 0.5;
} );

// write to STDOUT
process.stdout.write( JSON.stringify(data) + "\n" );
```

Rõ ràng plugin của bạn sẽ thực hiện điều gì đó hữu ích hơn thế này, nhưng bạn đã hiểu ý tưởng. Hãy xem các phần sau để tìm hiểu xem bạn có thể đưa thêm những gì vào các phần tử của mảng `items`.

##### Dữ Liệu Trigger

Khi trigger plugin của bạn quyết định khởi chạy một job, bạn có thể tùy chọn đưa vào dữ liệu tùy ý vốn sẽ được chuyển tới job đó. Việc này được thực hiện bằng cách đưa một đối tượng `data` vào bên trong phần tử item, nằm cạnh thuộc tính boolean `launch`. Ví dụ:

```json
{
	"xy": 1,
	"items": [ 
		{
			"launch": false
		},
		{
			"launch": false
		},
		{
			"launch": true,
			"data": { 
				"mykey1": "myvalue1",
				"mykey2": "myvalue2"
			}
		}
	]
}
```

Định dạng của thuộc tính `data` do người dùng tự định nghĩa, và nó sẽ được chuyển nguyên bản tới job được khởi chạy, trở thành thuộc tính [input.data](data.md#job-input) bên trong đối tượng [Job](data.md#job) (tương tự như khi dữ liệu được chuyển tới nó từ một job liên kết trước đó, workflow, action, v.v.).

##### File Trigger

Bạn cũng có thể gửi các file đi kèm tới các job được khởi chạy của mình. Chúng sẽ được đính kèm vào job dưới dạng các đầu vào, và tự động được tải xuống thư mục tạm của mỗi job trên server từ xa. Để làm điều này, hãy đưa một mảng `files` vào cạnh thuộc tính `launch` của bạn. Mảng files nên chứa dữ liệu như thế này:

```json
{
	"xy": 1,
	"items": [ 
		{
			"launch": false
		},
		{
			"launch": false
		},
		{
			"launch": true,
			"files": [
				{ "path": "/path/to/file.jpg", "delete": true }
			]
		}
	]
}
```

Mỗi đối tượng trong mảng `files` cần có một thuộc tính `path` trỏ đến một file duy nhất. Bạn cũng có thể tùy chọn chuyển một thuộc tính `delete`. Nếu thuộc tính này được đặt thành `true`, PTOps sẽ tự động xóa file sau khi nó được tải lên.

Cơ chế này hoạt động tương tự như khi các file được chuyển tới job của bạn từ một job liên kết trước đó, workflow, action, v.v.

##### Trì Hoãn Trigger

Nếu bạn muốn trì hoãn một lượt khởi chạy job, hãy gửi lại một thuộc tính `delay` bên cạnh thuộc tính Boolean `launch`, đặt giá trị thành số giây bạn muốn job chờ đợi trước khi chạy. Ví dụ:

```json
{
	"xy": 1,
	"items": [ 
		{
			"launch": false
		},
		{
			"launch": false
		},
		{
			"launch": true,
			"delay": 30
		}
	]
}
```

Lưu ý rằng cơ chế này hoạt động tương tự như tùy chọn scheduler [Trì Hoãn (Delay)](triggers.md#trì-hoãn) tích hợp sẵn. Nghĩa là, job vẫn "khởi chạy" nhưng được đặt ở trạng thái chờ đặc biệt cho đến khi thời gian trì hoãn chỉ định trôi qua, tại thời điểm đó job sẽ trở nên hoạt động và chạy bình thường. Cũng lưu ý rằng giá trị trì hoãn được tính toán tương đối so với thời gian bắt đầu ban đầu của job (tức là thời gian thực tế trên từng phút [Job.now](data.md#job-now)).

### Monitor Plugins

Monitor Plugins có thể mở rộng hệ thống giám sát của PTOps bằng cách thu thập **bất kỳ** metric tùy chỉnh nào bạn muốn. Các Plugin này chạy trực tiếp trên các server mà chúng được nhắm mục tiêu (tức là xySat chạy chúng dưới dạng các tiến trình con), và sau đó các metric tùy chỉnh của chúng được đưa vào cùng với dữ liệu giám sát phút cuối cùng của server được gửi lại cho conductor chính của PTOps.

Thay vì chạy để phản hồi một event hay action, Monitor Plugins chạy mỗi phút một lần, 24x7. Về bản chất chúng là "bộ thu thập dữ liệu", và dự kiến sẽ tạo ra dữ liệu giám sát cho thời điểm chúng chạy, hoặc trong nhiều trường hợp chúng trả về dữ liệu tích lũy cho 60 giây vừa qua.

Monitor Plugins khác với các loại Plugin khác của PTOps ở chỗ chúng không được truyền một tài liệu JSON trên STDIN, và chúng không cần tạo ra một định dạng đầu ra JSON cụ thể. Ràng buộc API cho các plugin này đơn giản hơn -- chúng chỉ thực thi mỗi phút, và chúng có thể xuất ra định dạng JSON, XML tùy ý hoặc văn bản thuần. Sau đó, các [Monitor](monitors.md) của bạn sẽ tự rút trích các giá trị dữ liệu cụ thể từ dữ liệu đó và sử dụng chúng cho các biểu đồ, alert, v.v.

Dưới đây là một ví dụ. Plugin này thực sự đi kèm với PTOps, và nó theo dõi tổng số file đang mở trên server:

- **Tiêu đề Plugin**: Count Open Files
- **Plugin ID**: `open_files`
- **Lệnh**: `/bin/sh`
- **Script**: `cat /proc/sys/fs/file-nr`
- **Định dạng**: `text`

Chỉ vậy thôi -- đó là toàn bộ Plugin, bao gồm cả mã nguồn. Trong ví dụ này, mã nguồn là script shell `/bin/sh` nhỏ này:

```sh
cat /proc/sys/fs/file-nr
```

Đầu ra của lệnh này rõ ràng chỉ là văn bản thuần:

```
1056	0	9223372036854775807
```

Nhưng điều đó vẫn ổn! Cú pháp không quan trọng ở điểm này. Những gì xảy ra là dữ liệu thô này được đưa vào cùng với [ServerMonitorData.commands](data.md#servermonitordata-commands) của server, được định danh bằng [Plugin.id](data.md#plugin-id), và sau đó được cung cấp cho các monitor và alert ở định dạng này:

```json
"commands": {
	"open_files": "1056\t0\t9223372036854775807"
}
```

Sau đó một cách riêng biệt, chúng tôi định nghĩa một [Monitor](monitors.md) để kéo giá trị thích hợp (trong trường hợp này là con số đầu tiên) ra khỏi văn bản thô:

- **Tiêu đề Monitor**: Open Files
- **Biểu thức**: `commands.open_files`
- **Khớp Dữ Liệu**: `(\\d+)`
- **Kiểu Dữ Liệu**: `integer`

Và mọi việc đơn giản như thế. Monitor tùy chỉnh của chúng tôi giờ đây có thể vẽ biểu đồ tổng số file đang mở trên server theo thời gian, dựa trên một lệnh tùy chỉnh chúng tôi thực thi.

Nếu Monitor Plugin của bạn được đặt thành định dạng XML hoặc JSON, bạn thực sự có thể xuất ra một cấu trúc dữ liệu lớn, đa giá trị, và các monitor khác nhau có thể lấy các giá trị cụ thể từ đó. Điều này thực sự hữu ích cho những việc như lấy **tất cả** các metric hiệu năng của ứng dụng của bạn trong một lệnh, xuất nó dưới dạng một cấu trúc JSON/XML lớn, và sau đó bạn có thể cấu hình các monitor PTOps riêng lẻ để kéo ra và vẽ biểu đồ cho các giá trị cụ thể. Các alert cũng có thể kích hoạt dựa trên các giá trị dữ liệu này.

## Tham Số Plugin

Hầu hết các Plugin chấp nhận một hoặc nhiều "tham số", vốn là các trường người dùng có thể cấu hình. Chúng được hiển thị trong UI để người dùng điền thông tin khi họ cấu hình các event hoặc workflow. Xem bên dưới để biết tất cả các loại tham số khả dụng. Xem [Plugin.params](data.md#plugin-params) để biết cấu trúc dữ liệu nội bộ.

Mỗi tham số được lưu trữ dưới dạng một đối tượng bên trong mảng `params` của Plugin. Mỗi loại control cần một `id` duy nhất cục bộ, một `title` hiển thị cho người dùng, và một `type`. Hầu hết các control cũng có một `value` mặc định, cùng các thuộc tính tùy chọn như `caption`, `required`, `regex` và `locked` nếu được hỗ trợ.

### Text

Một tham số loại "text" được hiển thị cho người dùng dưới dạng trường nhập văn bản một dòng.

Có thể đưa vào một thuộc tính `variant` tùy chọn, thuộc tính này sẽ thay đổi control UI hiển thị trong trình duyệt: `color`, `date`, `datetime-local`, `email`, `number`, `password`, `text`, `time`, `tel` hoặc `url`.

Lưu ý rằng giá trị tham số hầu như luôn được đặt thành một chuỗi -- thuộc tính `variant` chỉ kiểm soát control UI trực quan và hành vi. Tuy nhiên, variant "number" là một trường hợp đặc biệt, nơi giá trị thực sự sẽ được phân tích cú pháp và lưu trữ trong các tham số dưới dạng một số JavaScript Number thực tế, hoặc `null` khi để trống.

Variant "number" cũng đặc biệt ở chỗ bạn có thể chỉ định một thuộc tính `range` (chuỗi), giới hạn mức tối thiểu, tối đa và bước tăng (step) cho giá trị. Phạm vi nên ở định dạng: `MIN - MAX / STEP`. Ví dụ: để giới hạn phạm vi số từ 0 đến 100 với các bước tăng là 5, hãy sử dụng `0 - 100 / 5`. Số thực và số âm được cho phép, và bước tăng có thể là từ khóa đặc biệt `any` (để không áp đặt bước tăng cụ thể).

Ví dụ định nghĩa tham số văn bản:

```json
{
	"id": "filename",
	"title": "Filename",
	"type": "text",
	"variant": "text",
	"value": "",
	"caption": "Enter the target filename.",
	"required": true,
	"regex": "^[\\w\\-.]+$"
}
```

Ví dụ định nghĩa variant number:

```json
{
	"id": "timeout",
	"title": "Timeout",
	"type": "text",
	"variant": "number",
	"value": 30,
	"range": "1 - 300 / 1",
	"caption": "Enter the timeout in seconds.",
	"required": true
}
```

### Textarea

Một tham số loại "textarea" được hiển thị cho người dùng dưới dạng một hộp văn bản nhiều dòng. Tại đây, người dùng có thể nhập nhiều dòng văn bản (không áp đặt độ dài tối đa).

Ví dụ định nghĩa tham số textarea:

```json
{
	"id": "message",
	"title": "Message",
	"type": "textarea",
	"value": "",
	"caption": "Enter the message body.",
	"required": true,
	"regex": ".+"
}
```

### Code

Một tham số loại "code" là một biến thể của textarea, nhưng nó được hiển thị cho người dùng dưới dạng một nút bấm mở ra một hộp thoại trình biên tập code đầy đủ. Người dùng có thể nhập "code" thuộc bất kỳ ngôn ngữ nào, và định dạng sẽ tự động được phát hiện và highlight cú pháp.

Ví dụ định nghĩa tham số code:

```json
{
	"id": "script",
	"title": "Script Source",
	"type": "code",
	"value": "#!/bin/sh\n\n# Enter your shell script code here\n",
	"caption": "Enter the script source to execute.",
	"required": true
}
```

### JSON

Một tham số loại "JSON" là một biến thể của textarea, nhưng nó được hiển thị cho người dùng dưới dạng một nút bấm mở ra một hộp thoại trình biên tập code đầy đủ với tính năng highlight cú pháp JSON và số dòng. JSON cũng được xác thực, vì vậy người dùng chỉ có thể nhập một tài liệu JSON hợp lệ.

Loại tham số này đặc biệt ở chỗ JSON được phân tích cú pháp và lưu trữ trong các tham số dưới dạng một đối tượng thực tế (không phải một chuỗi).

Ví dụ định nghĩa tham số JSON:

```json
{
	"id": "headers",
	"title": "HTTP Headers",
	"type": "json",
	"value": {
		"Content-Type": "application/json"
	},
	"caption": "Enter custom request headers as a JSON object."
}
```

### Menu

Một "menu" được hiển thị dưới dạng một menu thả xuống (drop-down), với danh sách các mục cấu hình được. Plugin khai báo các mục này dưới dạng một danh sách phân tách bằng dấu phẩy (CSV). Ví dụ:

```
Alpha, Beta, Gamma
```

Mục này có loại `select` trong API, để khớp với phần tử HTML cùng tên.

Để đưa một mục trống vào đầu menu (cho phép người dùng chọn "không có gì" làm tùy chọn), chỉ cần bắt đầu danh sách CSV bằng một dấu phẩy dẫn đầu. Ví dụ:

```
, Alpha, Beta, Gamma
```

Để thiết lập giá trị mục (values) và nhãn hiển thị (labels) riêng biệt, hãy chỉ định các giá trị trong dấu ngoặc vuông như thế này:

```
Alpha [a1], Beta [b2], Gamma [c3]
```

Điều này sẽ chỉ hiển thị các nhãn trong menu ("Alpha", "Beta", "Gamma"), nhưng trong dữ liệu, các giá trị tương ứng sẽ được sử dụng thay thế (`a1`, `b2`, `c3`). Lưu ý rằng các giá trị chỉ có thể chứa chữ-số, dấu gạch dưới, dấu gạch ngang và dấu chấm, và khi tính năng này được sử dụng, các nhãn trực quan sẽ **không** được truyền vào dữ liệu chút nào.

Lưu ý rằng nếu bạn tick vào hộp kiểm "Multi-Select" khi cấu hình trường menu, giá trị tham số của bạn sẽ là một mảng các giá trị được chọn, thay vì là một chuỗi cho menu chọn một giá trị.

Ví dụ định nghĩa tham số menu chọn một giá trị (single-select):

```json
{
	"id": "environment",
	"title": "Environment",
	"type": "select",
	"value": "Development [dev], Staging [stage], Production [prod]",
	"caption": "Select the target environment.",
	"multiple": false
}
```

Ví dụ định nghĩa tham số menu chọn nhiều giá trị (multi-select):

```json
{
	"id": "regions",
	"title": "Regions",
	"type": "select",
	"value": "US East [us-east], US West [us-west], Europe [eu]",
	"caption": "Select one or more deployment regions.",
	"multiple": true
}
```

### Bucket Menu

Một "bucket menu" là một menu được điền động, tự động tải các mục của nó từ một [Storage Bucket](buckets.md) toàn cục mà bạn cấu hình. Bằng cách sử dụng tính năng này, bạn có thể có các menu trên nhiều Plugin hoặc event cùng chia sẻ chung một nhóm tài nguyên mục.

Để định nghĩa tập hợp các mục, chỉ cần tạo một Storage Bucket và chỉnh sửa dữ liệu JSON bên trong. Đặt mảng JSON của bạn ở bất kỳ đâu trong dữ liệu bucket. Ví dụ:

```json
{
	"countries": [
		"United States",
		"Canada",
		"Mexico",
		"Brazil",
		"United Kingdom",
		"France",
		"Germany",
		"Japan",
		"Australia",
		"South Africa"
	]
}
```

Hãy đảm bảo lưu các thay đổi của bucket sau khi chỉnh sửa JSON.

Sau đó, khi bạn thêm tham số của mình và chọn kiểu trường "Bucket Menu", bạn sẽ cần chọn bucket đích, và có thể nhập một đường dẫn "Data Path". Đường dẫn này giúp chỉ định *nơi* bên trong dữ liệu JSON của storage bucket mảng mục của bạn sinh sống. Trong ví dụ trên, nó nằm ở một thuộc tính cấp cao nhất tên là `countries`, vì vậy đó chính là nội dung bạn cần nhập cho Data Path.

Điều này cho phép bạn lưu trữ nhiều danh sách mục khác nhau trong cùng một storage bucket.

Ngoài ra, nếu mảng mục của bạn nằm ở cấp cao nhất của dữ liệu JSON bucket, tức là như thế này:

```json
[
	"United States",
	"Canada",
	"Mexico",
	"Brazil",
	"United Kingdom",
	"France",
	"Germany",
	"Japan",
	"Australia",
	"South Africa"
]
```

Thì bạn nên để trống trường "Data Path" (vì trong trường hợp này *toàn bộ* dữ liệu bucket chính là mảng).

Tính năng này cũng cho phép bạn tùy chỉnh các giá trị mục menu (tức là những gì đi vào [Job.params](data.md#job-params)) và các nhãn mục menu (tức là những gì được hiển thị trong menu) riêng biệt. Để làm điều này, hãy định nghĩa mảng JSON của bạn dưới dạng một mảng các đối tượng, với mỗi đối tượng chứa thuộc tính `id` và `title`. Ví dụ:

```json
{
	"countries": [
		{ "id": "US", "title": "United States" },
		{ "id": "CA", "title": "Canada" },
		{ "id": "MX", "title": "Mexico" },
		{ "id": "BR", "title": "Brazil" },
		{ "id": "GB", "title": "United Kingdom" },
		{ "id": "FR", "title": "France" },
		{ "id": "DE", "title": "Germany" },
		{ "id": "JP", "title": "Japan" },
		{ "id": "AU", "title": "Australia" },
		{ "id": "ZA", "title": "South Africa" }
	]
}
```

Như vậy trong trường hợp này nếu người dùng chọn "Germany" từ menu, giá trị thực tế của tham số job sẽ là chuỗi `DE`.

Cuối cùng, bạn có thể định nghĩa các nhóm mục trong menu bằng cách đưa vào một đối tượng chứa thuộc tính `label` và một mảng con `items`. Chúng hiển thị dưới dạng các phần có nhãn được phân ranh giới trong menu (còn gọi là một [optgroup](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup)). Ví dụ về việc này:

```json
{
	"countries": [
		{
			"label": "Americas",
			"items": [
				{ "id": "US", "title": "United States" },
				{ "id": "CA", "title": "Canada" },
				{ "id": "MX", "title": "Mexico" },
				{ "id": "BR", "title": "Brazil" }
			]
		},
		{
			"label": "Europe",
			"items": [
				{ "id": "GB", "title": "United Kingdom" },
				{ "id": "FR", "title": "France" },
				{ "id": "DE", "title": "Germany" }
			]
		},
		{
			"label": "Asia / Other",
			"items": [
				{ "id": "JP", "title": "Japan" },
				{ "id": "AU", "title": "Australia" },
				{ "id": "ZA", "title": "South Africa" }
			]
		}
	]
}
```

Lưu ý rằng nếu bạn tick vào hộp kiểm "Multi-Select" khi cấu hình trường bucket menu, giá trị tham số của bạn sẽ là một mảng các giá trị được chọn, thay vì là một chuỗi cho menu chọn một giá trị.

Ví dụ định nghĩa tham số bucket menu:

```json
{
	"id": "country",
	"title": "Country",
	"type": "bucket",
	"bucket_id": "countries",
	"bucket_path": "countries",
	"caption": "Select the country to process.",
	"multiple": false
}
```

Nếu mảng mục nằm ở cấp cao nhất của dữ liệu bucket, đặt `bucket_path` thành một chuỗi trống:

```json
{
	"id": "countries",
	"title": "Countries",
	"type": "bucket",
	"bucket_id": "countries",
	"bucket_path": "",
	"caption": "Select one or more countries to process.",
	"multiple": true
}
```

### System Menu

Một "system menu" là một menu được điền động, tương tự như [Bucket Menu](#bucket-menu), nhưng các mục menu được lấy trực tiếp từ bản thân PTOps. Điều này hữu ích khi một Plugin cần người dùng chọn một đối tượng PTOps hiện có, chẳng hạn như một event, category, server, server group, plugin, user, role, web hook hoặc monitor.

Khi bạn thêm tham số của mình và chọn loại trường "System Menu", bạn sẽ cần chọn danh sách PTOps nội bộ để sử dụng cho menu. Menu được điền tự động từ dữ liệu hệ thống hiện tại, và PTOps thêm một mục `(None)` ở đầu để không có mục nào được chọn theo mặc định.

Khi người dùng chọn một mục, thuộc tính `id` thông thường của mục được chọn sẽ được lưu trữ trong [Job.params](data.md#job-params) và truyền tới Plugin. Ví dụ: nếu bạn định nghĩa một tham số với ID `custom_event`, trỏ nó tới danh sách hệ thống Events, và người dùng chọn một event có ID `emp6dulft42zjevn8`, Plugin sẽ nhận được thông tin này:

```json
{
	"custom_event": "emp6dulft42zjevn8"
}
```

Hầu hết các system menu đều lưu trữ thuộc tính `id` thông thường của mục được chọn. Menu Users là một trường hợp đặc biệt, nó lưu trữ `username` của người dùng được chọn.

Các danh sách hệ thống sau đây khả dụng:

| Danh sách | Giá trị Lưu trữ |
|------|--------------|
| Alerts | Alert ID |
| Algorithms | ID thuật toán đích |
| Buckets | Bucket ID |
| Categories | Category ID |
| Channels | Channel ID |
| Events | Event ID |
| Groups | ID nhóm server |
| Monitors | Monitor ID |
| Plugins | Plugin ID |
| Roles | Role ID |
| Servers | Server ID |
| Tags | Tag ID |
| Targets | ID nhóm server hoặc ID server |
| Users | Username |
| Web Hooks | Web Hook ID |

Menu "Targets" là một danh sách kết hợp bao gồm cả các nhóm server và các server riêng lẻ, được sắp xếp thành các mục menu. Điều này tiện lợi cho các tham số Plugin cần chấp nhận một trong hai loại đích đến của job. Menu Algorithms chứa các thuật toán chọn đích đến của event tích hợp sẵn, chẳng hạn như Random.

Các API Key và Secret được cố tình không cung cấp làm nguồn cho system menu vì lý do bảo mật.

Lưu ý rằng nếu bạn tick vào hộp kiểm "Multi-Select" khi cấu hình trường system menu, giá trị tham số của bạn sẽ là một mảng các giá trị được chọn, thay vì là một chuỗi cho menu chọn một giá trị.

Ví dụ định nghĩa tham số system menu:

```json
{
	"id": "target_event",
	"title": "Target Event",
	"type": "system",
	"list_id": "events",
	"caption": "Select an event from the system.",
	"multiple": false
}
```

Ví dụ định nghĩa tham số system menu chọn nhiều giá trị (multi-select):

```json
{
	"id": "notify_users",
	"title": "Notify Users",
	"type": "system",
	"list_id": "users",
	"caption": "Select one or more users to notify.",
	"multiple": true
}
```

### Checkbox

Hộp kiểm được hiển thị cùng với một nhãn, và trạng thái "checked" được lưu dưới dạng giá trị tham số Boolean (`true` hoặc `false`).

Ví dụ định nghĩa tham số checkbox:

```json
{
	"id": "dry_run",
	"title": "Dry Run",
	"type": "checkbox",
	"value": true,
	"caption": "Preview changes without applying them."
}
```

### Hidden

Loại ẩn không được hiển thị trong UI. Thay vào đó, nó chỉ là một cặp key/value ẩn, được điền sẵn và chuyển tới Plugin dưới dạng tham số. Giá trị được chỉ định khi thêm trường ẩn.

Ví dụ định nghĩa tham số ẩn:

```json
{
	"id": "api_version",
	"title": "API Version",
	"type": "hidden",
	"value": "v2"
}
```

### Toolset

Có thể coi là mạnh mẽ nhất trong số các loại tham số Plugin, "toolset" được hiển thị dưới dạng một menu thả xuống, với một tập hợp động các tham số phụ xuất hiện dựa trên lựa chọn trong menu (tức là "công cụ" - tool). Bằng cách này, bạn có thể yêu cầu các tham số khác nhau từ người dùng dựa trên việc "công cụ" nào được chọn.

"Dữ liệu" của toolset được nhập ở định dạng JSON, mô tả tất cả các công cụ và tham số phụ sẽ được hiển thị cho từng công cụ. Dưới đây là một ví dụ:

```json
{
	"id": "s3_action",
	"title": "S3 Action",
	"type": "toolset",
	"caption": "Select which S3 operation to perform.",
	"data": {
		"default": "uploadFiles",
		"tools": [
			{
				"id": "uploadFiles",
				"title": "Upload Files",
				"description": "Upload local files to S3",
				"fields": [
					{
						"id": "localPath",
						"title": "Local Path",
						"type": "text",
						"value": ".",
						"caption": "The base filesystem path to find files under."
					},
					{
						"id": "filespec",
						"title": "Filename Pattern",
						"type": "text",
						"value": ".+",
						"caption": "Optionally filter the local files using a regular expression, applied to the filenames."
					},
					{
						"id": "remotePath",
						"title": "Remote Path",
						"type": "text",
						"value": "",
						"caption": "The base S3 path to store files under.",
						"required": true
					}
				]
			},
			{
				"id": "listFiles",
				"title": "List Files",
				"description": "Generate a file listing of an S3 prefix",
				"fields": [
					{
						"id": "remotePath",
						"title": "Remote Path",
						"type": "text",
						"value": "",
						"caption": "The base S3 path to look for files under.",
						"required": true
					}
				]
			}
		]
	}
}
```

Ở đây, menu toolset sẽ hiển thị hai công cụ: "Upload Files" và "List Files". Khi "Upload Files" được chọn trong menu, ba tham số phụ mới sẽ xuất hiện trong một khung bên dưới menu: "Local Path", "Filename Pattern" và "Remote Path". Nếu người dùng chọn một công cụ khác, ví dụ "List Files", các tham số phụ sẽ thay đổi và một tập hợp khác sẽ được hiển thị.

Các trường của công cụ sử dụng cùng định dạng nội bộ như các tham số plugin thông thường, nhưng chỉ các loại trường [checkbox](#checkbox), [code](#code), [json](#json), [hidden](#hidden), [select](#select), [text](#text) và [textarea](#textarea) được phép sử dụng bên trong một toolset. Dưới đây là một ví dụ khác hiển thị tất cả các loại trường khả dụng trong một công cụ duy nhất:

```json
{
	"type": "toolset",
	"id": "tool",
	"title": "Tool Select",
	"caption": "",
	"data": {
		"tools": [
			{
				"id": "sample",
				"title": "Sample Tool",
				"fields": [
					{
						"id": "txt",
						"title": "Text Field",
						"type": "text",
						"value": ""
					},
					{
						"id": "txta",
						"title": "Text Area",
						"type": "textarea",
						"value": ""
					},
					{
						"id": "cbox",
						"title": "Checkbox",
						"type": "checkbox",
						"value": false
					},
					{
						"id": "sel",
						"title": "Select",
						"type": "select",
						"value": "Frog,Toad,Cat,Dog"
					},
					{
						"id": "cod",
						"title": "Code Editor",
						"type": "code",
						"value": "#!/usr/bin/something"
					},
					{
						"id": "jos",
						"title": "JSON Editor",
						"type": "json",
						"value": { "foo": "bar" }
					},
					{
						"id": "hid",
						"title": "Hidden",
						"type": "hidden",
						"value": "boo"
					}
				]
			}
		]
	}
}
```

Lưu ý rằng khi tất cả các giá trị tham số được thu thập từ người dùng, chúng sẽ được "làm phẳng" (flattened) thành một đối tượng cấp duy nhất, và chúng chia sẻ chung namespace với tất cả các tham số plugin khác. Do đó, các ID trường phải là duy nhất và không trùng lặp với bất kỳ tham số plugin nào khác được định nghĩa bên ngoài toolset. Tuy nhiên, các ID trường giống nhau có thể được sử dụng giữa các công cụ khác nhau, vì tại một thời điểm chỉ có một công cụ được chọn.

### Group

Sử dụng loại control `group` để tự động nhóm tất cả các control bên dưới thành một fieldset (khung trực quan), với một nhãn tùy chỉnh và một chú thích tùy chọn định dạng bằng Markdown. Nhóm sẽ bao gồm tất cả các control bên dưới nó, cho đến khi gặp một trong các đối tượng sau:

- Một nhóm có tên khác
- Một tham số dạng toolset
- Điểm kết thúc của danh sách tham số

Các nhóm chỉ đóng vai trò phân tách trực quan và không thay đổi bất kỳ chức năng hay tên tham số nào, v.v.

Ví dụ nhóm:

```json
{
	"id": "group_resize",
	"title": "Resize",
	"type": "group",
	"caption": "Optionally resize each input image before any other operations are applied."
}
```

Các nhóm cũng cần một `id` duy nhất cục bộ (dạng chữ-số).

## Macro Expansion

Tất cả các giá trị chuỗi của Tham Số Plugin đều hỗ trợ việc mở rộng macro nội tuyến bằng cách sử dụng cú pháp `{{ mustache }}` phổ biến. Bằng cách sử dụng tính năng này, bạn có thể chèn động các giá trị vào tham số từ dữ liệu tùy ý được chuyển vào job từ một job trước đó (node workflow kết nối hoặc được khởi chạy bằng action). Dưới đây là cách hoạt động. Hãy tưởng tượng rằng một job trước đó hoàn thành và xuất ra dữ liệu sau:

```json
{
	"xy": 1,
	"code": 0,
	"data": {
		"animal": "frog",
		"color": "green"
	}
}
```

Đối tượng dữ liệu này sau đó được chuyển vào đầu vào của job tiếp theo (bởi workflow hoặc run event action). Bạn có thể truy cập dữ liệu trực tiếp trong Plugin của mình bằng cách phân tích cú pháp JSON từ STDIN và tìm trong `input.data`. Tuy nhiên, ý tưởng với việc mở rộng macro là người dùng có thể định tuyến lại các giá trị dữ liệu vào các tham số của Plugin. Giả sử Plugin của bạn có một tham số trường văn bản, và người dùng đã điền nó trong cấu hình event như thế này:

```
My favorite animal is {{ data.animal }}, and my favorite color is {{ data.color }}.
```

Khi job chạy, những placeholder `{{ mustache }}` đó sẽ tự động được mở rộng bằng cách sử dụng đối tượng [Job](data.md#job) làm ngữ cảnh. Ngoài ra, đối tượng con [Job.input](data.md#job-input) được "làm phẳng" vào ngữ cảnh bên ngoài để thuận tiện (để bạn có thể bỏ qua tiền tố `input` trong các macro). Điều này cho phép bạn truy cập tất cả dữ liệu đầu ra từ job trước đó trong job hiện tại, và sao chép nó vào các tham số của Plugin.

Các macro mustache có thể làm nhiều việc hơn là chỉ tra cứu dữ liệu. Chúng cũng có thể đánh giá các biểu thức đơn giản kiểu JavaScript. Để biết thêm về vấn đề này, hãy xem [Cú pháp Biểu thức PTOps](xyexp.md).

## Các Plugin Tích Hợp Sẵn

Các Event Plugins sau đây được tích hợp sẵn vào PTOps và được cài đặt sẵn.

### Shell Plugin

PTOps đi kèm với một "Shell Plugin" tích hợp sẵn, bạn có thể sử dụng nó để thực thi các script shell tùy ý. Chỉ cần chọn Shell Plugin khi tạo một event hoặc workflow, và nhập script của bạn. Đây là một cách dễ dàng để bắt đầu nhanh chóng vì bạn không phải lo lắng về việc đọc hoặc ghi JSON.

Dưới đây là các tham số nó chấp nhận:

| Tên Tham Số | ID Tham Số | Loại | Mô tả |
|------------|----------|------|-------------|
| **Script Source** | `script` | Code | Nhập mã nguồn script shell để chạy. Tham số này được **Khóa cho Quyền Admin (Administrator Locked)** theo mặc định, do đó người dùng tiêu chuẩn và các API Key không có quyền admin không thể thay đổi nó trừ khi quản trị viên mở khóa tham số hoặc cấp quyền admin. |
| **Add Date/Time Stamps to Log** | `annotate` | Checkbox | Thêm dấu thời gian vào trước các dòng stdout không phải JSON trong đầu ra của job, giúp mỗi dòng dễ dàng được theo dõi hơn trong các job chạy lâu. |
| **Data Passthrough** | `pass` | Checkbox | Tùy chọn kế thừa sao chép dữ liệu đầu vào của job vào dữ liệu đầu ra của job, nhờ đó các node workflow tiếp theo hoặc các action run-event nhận được cùng một dữ liệu. Đối với các workflow mới, [Dữ Liệu Workflow](workflows.md#sharing-data-between-all-nodes) thường là tùy chọn tốt hơn. |

> [!IMPORTANT]
> Shell Plugin có thể thực thi mã tùy ý trên các server của bạn. Hãy giữ tham số `script` bị khóa quyền quản trị viên trừ khi bạn thực sự muốn người dùng thông thường hoặc API Key cung cấp các lệnh shell.

Shell Plugin quyết định thành công hay thất bại dựa trên [mã thoát (exit code)](https://en.wikipedia.org/wiki/Exit_status) của script của bạn. Mặc định mã thoát `0` đại diện cho thành công. Nghĩa là, nếu bạn muốn kích hoạt lỗi, hãy thoát với một mã trạng thái khác không, và đảm bảo bạn in thông báo lỗi ra STDOUT hoặc STDERR (cả hai sẽ được thêm vào phần chụp đầu ra của job của bạn). Ví dụ:

```sh
#!/bin/bash

# Perform tasks or die trying...
/usr/local/bin/my-task-1.bin || exit 1
/usr/local/bin/my-task-2.bin || exit 1
/usr/local/bin/my-task-3.bin || exit 1
```

Bạn vẫn có thể báo cáo tiến độ trung gian với Shell Plugin. Nó có thể chấp nhận định dạng JSON trong [định dạng đầu ra tiêu chuẩn](#progress) nếu được bật, nhưng cũng có một cách viết tắt. Bạn có thể echo một con số duy nhất trên dòng riêng của nó, từ 0 đến 100, kèm theo hậu tố `%`, và dòng đó sẽ được hiểu là tiến độ hiện tại. Ví dụ:

```sh
#!/bin/bash

# Perform some long-running task...
/usr/local/bin/my-task-1.bin || exit 1
echo "25%"

# And another...
/usr/local/bin/my-task-2.bin || exit 1
echo "50%"

# And another...
/usr/local/bin/my-task-3.bin || exit 1
echo "75%"

# And the final task...
/usr/local/bin/my-task-4.bin || exit 1
```

Điều này cho phép PTOps hiển thị thanh tiến trình đồ họa trong UI, và ước tính thời gian còn lại dựa trên thời gian đã trôi qua và tiến độ hiện tại.

> [!TIP]
> Shell Plugin thực tế hỗ trợ bất kỳ ngôn ngữ lập trình kịch bản thông dịch nào, bao gồm Node.js, PHP, Perl, Python, và nhiều ngôn ngữ khác. Cơ bản, bất kỳ ngôn ngữ nào hỗ trợ dòng [Shebang](https://en.wikipedia.org/wiki/Shebang_%28Unix%29) đều hoạt động trong Shell Plugin. Chỉ cần thay đổi `#!/bin/sh` để trỏ tới trình thông dịch bạn chọn.

### HTTP Request Plugin

PTOps đi kèm với một Plugin "HTTP Request" tích hợp sẵn, bạn có thể sử dụng nó để gửi các yêu cầu GET, HEAD hoặc POST đơn giản tới bất kỳ URL nào, và ghi log phản hồi. Bạn có thể chỉ định các header yêu cầu HTTP tùy chỉnh, và cũng cung cấp các biểu thức chính quy (regular expressions) để khớp một phản hồi thành công dựa trên nội dung.

Dưới đây là các tham số nó chấp nhận:

| Tên Tham Số | ID Tham Số | Loại | Mô tả |
|------------|----------|------|-------------|
| **Method** | `method` | Menu | Chọn phương thức yêu cầu HTTP, một trong các phương thức GET, HEAD, POST, PUT hoặc DELETE. |
| **URL** | `url` | Text | Nhập URL đầy đủ của bạn tại đây, phải bắt đầu bằng `http://` hoặc `https://`. |
| **Headers** | `headers` | Text Box | Tùy chọn bao gồm bất kỳ header yêu cầu tùy chỉnh nào tại đây, mỗi dòng một header. |
| **POST Data** | `data` | Text Box | Nếu bạn đang gửi một HTTP POST, hãy nhập dữ liệu POST thô tại đây. |
| **Timeout** | `timeout` | Number | Nhập thời gian chờ (timeout) tính bằng giây, được tính là thời gian nhận được byte đầu tiên trong phản hồi. |
| **Idle Timeout** | `idle_timeout` | Number | Nhập thời gian chờ rảnh rỗi tính bằng giây, được đo giữa các gói dữ liệu sau khi phản hồi bắt đầu. |
| **Connect Timeout** | `connect_timeout` | Number | Nhập thời gian chờ kết nối tính bằng giây, được đo trong khi mở kết nối socket. |
| **Success Match** | `success_match` | Text | Tùy chọn nhập một biểu thức chính quy tại đây để so khớp với phần body phản hồi. Nếu được chỉ định, biểu thức này phải khớp để coi job là thành công. |
| **Error Match** | `error_match` | Text | Tùy chọn nhập một biểu thức chính quy tại đây để so khớp với phần body phản hồi. Nếu biểu thức này khớp với body phản hồi, job sẽ bị hủy bỏ với một lỗi. |
| **Follow Redirects** | `follow` | Checkbox | Tick vào ô này để tự động đi theo các phản hồi chuyển hướng HTTP (tối đa 32 lần). |
| **Download File** | `download` | Checkbox | Tick vào ô này để đính kèm body phản hồi dưới dạng file đầu ra của job thay vì ghi log nó dưới dạng văn bản. |
| **SSL Cert Bypass** | `ssl_cert_bypass` | Checkbox | Tick vào ô này nếu bạn cần thực hiện các yêu cầu HTTPS tới các server có chứng chỉ SSL không hợp lệ (tự ký hoặc chứng chỉ khác). |

#### Chuỗi Yêu Cầu (Request Chaining)

HTTP Request Plugin hỗ trợ chuyển dữ liệu giữa các job. Đầu tiên, thông tin về phản hồi HTTP được chuyển vào dữ liệu đầu ra của job, nhờ đó các event liên kết có thể đọc và hành động dựa trên đó. Cụ thể, mã phản hồi HTTP, tất cả các header phản hồi HTTP, và có thể cả bản thân nội dung body (nếu được định dạng dưới dạng JSON và nhỏ hơn 1 MB) sẽ được bao gồm. Ví dụ:

```js
"data": {
	"statusCode": 200,
	"statusMessage": "OK",
	"headers": {
		"date": "Sat, 14 Jul 2018 20:14:01 GMT",
		"server": "Apache/2.4.28 (Unix) LibreSSL/2.2.7 PHP/5.6.30",
		"last-modified": "Sat, 14 Jul 2018 20:13:54 GMT",
		"etag": "\"2b-570fb3c47e480\"",
		"accept-ranges": "bytes",
		"content-length": "43",
		"connection": "close",
		"content-type": "application/json",
		"x-uuid": "7617a494-823f-4566-8f8b-f479c2a6e707"
	},
	"json": {
		"key1": "value1",
		"key2": 12345
	}
}
```

Trong ví dụ này, một yêu cầu HTTP đã được thực hiện và trả về các header phản hồi cụ thể đó (các tên header được chuyển đổi thành chữ thường), và phần body cũng được định dạng dưới dạng JSON, vì vậy bản thân dữ liệu JSON được phân tích cú pháp và bao gồm trong thuộc tính có tên là `json`. Các event downstream được liên kết với job HTTP Request (qua node workflow hoặc action run event) có thể đọc các thuộc tính này và hành động dựa trên chúng.

Thứ hai, bạn có thể nối một HTTP Request vào một HTTP Request *khác*, và sử dụng các giá trị dữ liệu chuỗi từ phản hồi trước đó trong yêu cầu tiếp theo. Để làm điều này, bạn cần sử dụng cú pháp template `{{ mustache }}` đặc biệt trong yêu cầu thứ hai, để tra cứu các giá trị trong đối tượng `data` từ yêu cầu đầu tiên. Bạn có thể sử dụng các placeholder này trong các trường văn bản **URL**, **Request Headers** và **POST Data**. Ví dụ:

- **URL**: `http://myserver.com/test.json?key={{ data.json.key1 }}`
- **Headers**: `X-UUID: {{ data.headers['x-uuid'] }}`

Tại đây bạn có thể thấy chúng ta đang sử dụng hai placeholder, một trong URL và một trong các header yêu cầu HTTP. Chúng đang tìm kiếm các giá trị từ một event HTTP Request *trước đó*, và chuyển chúng vào yêu cầu tiếp theo. Cụ thể, chúng ta đang sử dụng:

| Placeholder | Mô tả |
|-------------|-------------|
| `{{ data.json.key1 }}` | Placeholder này tra cứu giá trị `key` từ dữ liệu JSON (nội dung body) của phản hồi HTTP trước đó. Sử dụng ví dụ phản hồi của chúng tôi hiển thị ở trên, placeholder này sẽ phân giải thành `value1`. |
| `{{ data.headers['x-uuid'] }}` | Placeholder này tra cứu header phản hồi `X-UUID` từ phản hồi HTTP trước đó. Sử dụng ví dụ phản hồi của chúng tôi hiển thị ở trên, placeholder này sẽ phân giải thành `7617a494-823f-4566-8f8b-f479c2a6e707`. |

Do đó, một khi yêu cầu thứ hai được gửi đi, sau khi mở rộng placeholder, URL sẽ thực sự phân giải thành:

```
http://myserver.com/test.json?key=value1
```

Và header sẽ mở rộng thành:

```
X-UUID: 7617a494-823f-4566-8f8b-f479c2a6e707
```

Bạn có thể liên kết bao nhiêu yêu cầu tùy thích, nhưng lưu ý rằng mỗi yêu cầu chỉ có thể nhìn thấy và hành động dựa trên dữ liệu chuỗi từ yêu cầu *ngay trước đó* (yêu cầu trực tiếp liên kết đến nó).

#### Sử dụng Secret trong Yêu Cầu

Để sử dụng các secret trong HTTP Request Plugin, bạn cần chỉ định chúng bằng cú pháp macro tùy chỉnh: `[secrets.KEY_NAME]`. Định dạng dấu ngoặc vuông này hoạt động trong URL, các header yêu cầu, và body yêu cầu.

Lưu ý rằng các secret sẽ được che lại trên màn hình hiển thị đầu ra của job.

### Test Plugin

Test Plugin tồn tại chủ yếu để kiểm thử PTOps, nhưng nó cũng có thể hữu ích để kiểm thử các phần của workflow. Nó tạo ra dữ liệu mẫu và tùy chọn xuất ra một file mẫu để chuyển cho các event tiếp theo nếu được kết nối. Nó cũng có thể mô phỏng các kết quả job khác nhau (thành công, lỗi, v.v.). Nó cung cấp các tham số sau:

| Tên Tham Số | ID Tham Số | Loại | Mô tả |
|------------|----------|------|-------------|
| **Test Duration** | `duration` | Number | Số giây cần chạy trước khi báo cáo hoàn thành. Tiến độ luôn được báo cáo. |
| **Simulate Result** | `action` | Menu | Chọn kết quả muốn mô phỏng (Success, Error, Warning, Critical, Crash). |
| **Custom Value** | `custom` | Text | Nhập một giá trị tùy chọn để đưa vào dữ liệu đầu ra thử nghiệm. |
| **Burn Memory/CPU** | `burn` | Checkbox | Nếu được tick, Plugin sẽ sử dụng một số bộ nhớ và CPU (nó sẽ cấp phát 128-256MB bộ nhớ và sử dụng khoảng 10% lõi CPU để thực hiện phép toán trong một vòng lặp). |
| **Generate Network Traffic** | `network` | Checkbox | Nếu được tick, Plugin sẽ thực hiện các yêu cầu mạng liên tục để tải xuống các blob dữ liệu nhị phân lớn (từ GitHub). |
| **Upload Sample File** | `upload` | Checkbox | Nếu được tick, Plugin sẽ tạo ra một file mẫu và đính kèm nó vào đầu ra của job. |

### Fire Web Hook Plugin

PTOps đi kèm với một Plugin "Fire Web Hook" tích hợp sẵn, bạn có thể sử dụng nó để kích hoạt một trong các [Web Hook](webhooks.md) đã cấu hình của mình dưới dạng một job tiêu chuẩn. Điều này hữu ích khi việc gửi web hook cần phải là một phần trong đồ thị job thực tế của một workflow, thay vì là một [Action](actions.md) theo sau chạy sau khi một job khác đã hoàn thành.

Action Web Hook tiêu chuẩn vẫn là lựa chọn phù hợp nhất cho các thông báo và tác dụng phụ (side effects), nơi việc gửi thất bại không nên thay đổi kết quả của job gốc. Fire Web Hook Plugin thì khác: bản thân web hook chính là job. Nếu web hook thành công, job thành công. Nếu web hook thất bại, job thất bại, và bạn có thể rẽ nhánh, thử lại, hủy bỏ workflow, hoặc chạy các logic tiếp theo dựa trên kết quả đó.

> [!NOTE]
> Plugin này được bao gồm trong các bản cài đặt mới bắt đầu từ PTOps v1.0.69 và xySat v1.0.31. Các bản cài đặt hiện tại được nâng cấp từ các phiên bản trước đó có thể cần import [file import Fire Web Hook Plugin](https://pixlcore.com/software/xywiki/xyops-plugin-hookplug.json), vì việc nâng cấp PTOps hiện không tự động làm thay đổi cấu hình hệ thống hiện có.

Dưới đây là các tham số nó chấp nhận:

| Tên Tham Số | ID Tham Số | Loại | Mô tả |
|------------|----------|------|-------------|
| **Web Hook** | `web_hook` | System Menu | Chọn web hook PTOps đã cấu hình để kích hoạt. Trường này là bắt buộc. |
| **Custom Text** | `text` | Text Box | Tùy chọn nhập văn bản tùy chỉnh để thêm vào cuối tin nhắn web hook được tạo tiêu chuẩn. |

Web hook được chọn vẫn sử dụng định nghĩa web hook thông thường, bao gồm URL, phương thức, các header, body, các secret, thời gian chờ, số lần thử lại, cài đặt chuyển hướng, cài đặt TLS, và các biểu thức template `{{ ... }}`. Xem [Web Hook](webhooks.md) để biết thêm chi tiết.

Lưu ý rằng tham số **Custom Text** chỉ có ý nghĩa nếu template web hook được chọn sử dụng giá trị `{{text}}` tiêu chuẩn ở đâu đó, ví dụ trong một trường JSON body như `text`, `content` hoặc `message`. Nếu body web hook của bạn không tham chiếu `{{text}}`, thì văn bản bổ sung này sẽ không được gửi tới endpoint từ xa.

### Docker Plugin

Docker Plugin cho phép bạn chạy các script tùy chỉnh bên trong một container Docker. Tương tự như [Shell Plugin](#shell-plugin), bạn có thể chỉ định bất kỳ đoạn code tùy chỉnh nào để chạy, bằng bất kỳ ngôn ngữ nào, miễn là nó hỗ trợ dòng [Shebang](https://en.wikipedia.org/wiki/Shebang_%28Unix%29).

Bạn có thể nhập bất kỳ Docker image nào để sử dụng, bao gồm cả các image từ xa. Theo mặc định, [PTOps Shell Image](https://github.com/pixlcore/xyops-shell-image) của chúng tôi được chọn, dựa trên Debian 12 và được cài đặt sẵn nhiều phần mềm phổ biến, cũng như công cụ bọc [xyRun](https://github.com/pixlcore/xyrun) của chúng tôi. xyRun sẽ theo dõi tài nguyên hệ thống *bên trong* container, cũng như quản lý việc upload/download file cho các job của bạn. Đây là tùy chọn, và bạn có thể sử dụng bất kỳ Docker image nào bạn muốn, bao gồm cả các image tùy chỉnh của riêng bạn.

Dịch vụ này được xây dựng trên nền tảng [docker run](https://docs.docker.com/reference/cli/docker/container/run/), vì vậy mỗi job sẽ tạo ra một container mới, và có thể tùy chọn xóa nó khi job hoàn thành (đây là hành vi mặc định).

Docker Plugin sử dụng các tham số sau:

| Tên Tham Số | ID Tham Số | Loại | Mô tả |
|------------|----------|------|-------------|
| **Image Name** | `image_name` | Text | Tên của Docker image sử dụng, có thể là local hoặc remote. |
| **Image Version** | `image_ver` | Text | Phiên bản của image sử dụng, hoặc `latest`. |
| **Container Name** | `cont_name` | Text | Tên của Docker container, có thể sử dụng các macro như `{{id}}` để đảm bảo nó duy nhất cho mỗi job. |
| **Max CPUs** | `cont_cpus` | Number | Số lượng lõi CPU tối đa container được phép sử dụng, hoặc 0 để không giới hạn. |
| **Max Memory** | `cont_mem` | Text | Lượng bộ nhớ tối đa cho phép container sử dụng (mặc định là không giới hạn). |
| **Join Network** | `cont_net` | Text | Tùy chọn chỉ định một tên mạng Docker để container tham gia vào. |
| **Command Extras** | `cont_extras` | Text | Tùy chọn thêm bất kỳ đối số dòng lệnh bổ sung nào để chuyển tới `docker run` (ví dụ volume mounts). |
| **Launch Command** | `cont_cmd` | Text | Lệnh ban đầu để chạy khi container khởi động. Khuyến nghị sử dụng [xyRun](https://github.com/pixlcore/xyrun) cho việc này để tài nguyên được giám sát và các file được quản lý chính xác. |
| **Run Mode** | `run_mode` | Menu | Chọn xem bạn muốn toàn bộ dữ liệu JSON của job được gửi tới STDIN, hay chỉ gửi mã nguồn script (nâng cao). |
| **Script Source** | `script` | Code | Code chạy bên trong container. Bạn có thể sử dụng bất kỳ ngôn ngữ nào hỗ trợ dòng shebang. |
| **Init Process Manager** | `cont_init` | Checkbox | Chạy một tiến trình "init" bên trong container để chuyển tiếp tín hiệu và thu hồi các tiến trình con (reap processes). |
| **Ephemeral Container** | `cont_rm` | Checkbox | Tự động xóa container sau khi job hoàn thành (khuyến nghị). |
| **Verbose Logging** | `verbose` | Checkbox | Bật ghi log debug chi tiết (lệnh docker thô, v.v.). |

#### Image Tùy Chỉnh (Custom Images)

Bạn có thể tự do tạo Docker image tùy chỉnh của riêng mình để sử dụng trong Docker Plugin. Bạn có thể xây dựng một image dựa trên image của chúng tôi, hoặc tự xây dựng từ đầu. Dù bằng cách nào, chúng tôi khuyên bạn nên cài đặt [xyRun](https://github.com/pixlcore/xyrun) bên trong image của mình làm trình bọc lệnh, để PTOps có thể theo dõi việc sử dụng tài nguyên hệ thống, và quản lý các file cho các job của bạn.

Nếu bạn sử dụng một image không có xyRun, vui lòng lưu ý các cảnh báo sau:

- Các biến môi trường sẽ không được thiết lập (tức là `JOB_ID`, `JOB_NOW`, v.v.).
- Các secret sẽ không được truyền vào container.

Để sử dụng một Docker image có sẵn như `ubuntu`, bạn có thể đặt lệnh khởi động thành một thứ như `sh`, và sau đó đặt "Run Mode" thành "Script Source". Việc này sẽ chuyển trực tiếp mã nguồn script của bạn tới STDIN của tiến trình khởi động, ví dụ `sh`, vốn sẽ thực thi nó bên trong container.

## Plugin Marketplace

PTOps có một Plugin Marketplace tích hợp sẵn, nhờ đó bạn có thể mở rộng tập hợp các tính năng của ứng dụng bằng cách tận dụng các Plugin được phát hành bởi cả PixlCore (nhà phát triển PTOps), cũng như cộng đồng lập trình viên. Để biết thêm về vấn đề này, vui lòng xem [Hướng Dẫn Marketplace](marketplace.md).
