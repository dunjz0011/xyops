# Workflows

## Tổng Quan

Workflow trong PTOps là các đồ thị trực quan gồm các node được kết nối bằng dây dẫn để điều khiển việc thực thi job. Về khái niệm, một workflow là một event có kèm đồ thị và một số hành vi runtime đặc biệt. Khi workflow chạy, nó trở thành một "job workflow" có thể sinh ra bất kỳ số lượng sub-job trên các node được kết nối. Hệ thống quản lý toàn bộ lifecycle của chúng, thu thập kết quả, áp dụng action và limit, và theo dõi mọi thứ trong bản ghi job cha.

Cách một workflow chạy, tổng quan:

- Một trigger node kích hoạt (ví dụ: trigger manual, trigger schedule, v.v.). Điều này khởi động job workflow và "sáng đèn" trigger node đó.
- Tất cả node được nối dây từ trigger đó sẽ kích hoạt. Nhiều output chạy song song trừ khi bị hạn chế bởi limit.
- Event node hoặc job node khởi chạy sub-job. Kết quả hoàn thành của chúng quyết định dây output nào sẽ kích hoạt tiếp theo.
- Controller node thực hiện fan-out/fan-in, lặp, điều kiện và multiplex.
- Action node và limit node gắn trực quan vào event/job node và được merge vào các sub-job đã khởi chạy.
- Workflow hoàn thành khi không còn node nào active và tất cả sub-job đã hoàn tất hoặc bị huỷ. Kết quả của job cha tóm tắt tổng thể thành công/cảnh báo/thất bại.

Workflow mạnh mẽ vì chúng kết hợp event tái sử dụng, job tùy biến, resource limit, job action, và điều khiển luồng trên một đồ thị. Chúng chạy mọi thứ song song theo mặc định, với concurrency được kiểm soát bởi resource limit.

## Khi Nào Nên Dùng Workflow

- **Điều phối (Orchestration)**: Điều phối nhiều job với logic điều kiện, join, và/hoặc delay.
- **Xử lý fan-out**: Chia một dataset hoặc danh sách file và xử lý các item song song, sau đó gộp kết quả.
- **Chạy đa target**: Chạy cùng một job trên nhiều server (multiplex) với tuỳ chọn giãn cách (stagger).
- **Tái sử dụng**: Kết hợp các event đã định nghĩa sẵn thành các luồng lớn hơn, hoặc tạo job node tùy biến khi việc làm một lần dễ hơn.
- **Xử lý hậu kỳ (Post-processing)**: Gắn action trực tiếp vào node với điều kiện, bao gồm thành công, thất bại, cảnh báo, và tag tuỳ chỉnh.

## Trình Chỉnh Sửa Đồ Thị

Trình chỉnh sửa workflow cung cấp:

- **Kết nối Node**: Nhấn nút cực (pole) để hàn kết nối. Các cặp không hợp lệ bị UI chặn. Điều kiện xuất hiện trực tiếp trên dây; nhấn để đổi.
- **Thêm Node**: Nhấn "Add Node" hoặc hàn từ một cực và nhấn vào nền để chèn node mới tại vị trí đó.
- **Nhân Bản**: Chọn một hoặc nhiều node (shift-click) và nhân bản; các kết nối giữa các node được chọn sẽ được giữ lại.
- **Tách Rời**: Tách tất cả kết nối đến/từ node đã chọn.
- **Xoá**: Xoá node đã chọn và bất kỳ dây kết nối nào. Xoá trigger node cũng xoá luôn trigger bên dưới.
- **Undo/Redo**: Lên đến 100 cấp cho tất cả thao tác chỉnh sửa.
- **Zoom/Cuộn**: Zoom vào/ra/đặt lại và kéo để di chuyển.
- **Test Selection**: Chạy test bắt đầu từ node đã chọn hoặc chỉ node đơn đó. Tuỳ chọn: tắt action/limit, cung cấp JSON input tuỳ chỉnh và/hoặc upload file.
- **Nút Chuẩn**: Cancel, Export, History, Save Changes.

## Các Loại Node

Node có các "cực" (pole) kết nối ở các cạnh: một cực input ở bên trái (luồng đến), một cực output ở bên phải (luồng đi), và với event/job node có một cực limit đặc biệt ở dưới dùng để gắn limit node. Các cực có thể kết nối với nhiều node trừ khi loại controller hạn chế output của nó như đã ghi chú dưới đây.

### Trigger Node

Trigger node biểu diễn trực quan các event trigger bên trong đồ thị, như manual, schedule, interval, webhook hoặc plugin trigger (xem [Triggers](triggers.md)). Chúng có một output duy nhất và thường cấp luồng cho Event, Job, hoặc Controller node.

Các bong bóng tuỳ chọn trigger đặc biệt (Catch-Up, Range, Blackout, Delay, Precision) không có cực và chỉ là các bộ điều chỉnh (modifier) sẽ sáng lên khi trigger được lập lịch liên kết của chúng kích hoạt; chúng không kết nối với gì cả.

### Event Node

Event node đặt một event đã tạo sẵn lên đồ thị. Bạn có thể override target, algo, tag và tham số người dùng cho lần dùng đó. Khi node chạy, sub-job kế thừa cấu hình của event cộng với override của node. Event node cũng có thể replay lại một job trước đó để test. Nếu event được tham chiếu là một workflow, nó phải bao gồm một trigger manual đã bật để engine biết bắt đầu sub-workflow ở đâu.

Event node có cực input, output và limit và có thể nhận luồng từ trigger, event/job node khác hoặc controller, và có thể gửi luồng đến event/job node khác, action, hoặc controller.

### Job Node

Job node là các job tùy biến không có event nền. Bạn chọn một plugin và cung cấp tham số bất kỳ, cộng với title/icon/category tuỳ chọn, target, algo và tag. Action và limit được gắn trên đồ thị sẽ được merge vào sub-job đã khởi chạy khi runtime. Job node cũng có thể replay lại một job trước đó để test. Job node cũng bao gồm cực input, output và limit, nhận luồng từ trigger/event/job/controller, và có thể gửi đến event/job/action/controller node.

Xem [Event Node vs Job Node](#event-node-vs-job-node) dưới đây.

### Action Node

Action node gắn action hậu-job vào event/job node và được merge vào sub-job đã khởi chạy với điều kiện đã chọn. Cách dùng phổ biến bao gồm thông báo email, webhook, hoặc tắt/xoá các lần chạy tương lai (xem [Actions](actions.md)).

Action node có một input duy nhất và kết nối từ event/job node.

### Limit Node

Limit node gắn kiểm soát resource vào event/job node và được merge vào limit của sub-job đã khởi chạy (xem [Limits](limits.md)). Ví dụ bao gồm Max Concurrent Jobs, Max Queue Size, CPU/Memory/Time và File input.

Một limit node kết nối qua cực limit ở dưới trên một event/job node.

### Controller Node

Controller thực hiện điều khiển luồng. Chúng thường có cực input và output và kết nối theo dòng giữa các node khác. Một số controller yêu cầu một kết nối output duy nhất; chi tiết ở các phần controller dưới đây.

#### Split Controller

Split controller phân tán công việc bằng cách lấy một danh sách input và khởi chạy một sub-job cho mỗi item. Cung cấp một [expression](xyexp.md) đến danh sách trong context job trước đó, ví dụ `data.rows`. Engine sẽ giải quyết đường dẫn và mong đợi một array; nếu giá trị là một string, nó sẽ được trim và tách theo dòng mới. Một trường hợp đặc biệt là `files`, dùng để chia array file đến sao cho mỗi sub-job nhận đúng một file.

Trong UI, hộp thoại cấu hình split controller cung cấp nút "Expression Builder", cho phép bạn khám phá output data từ các job hoàn thành gần đây, và chọn ra một đường dẫn JSON key cụ thể để dùng cho chuỗi expression.

Mỗi sub-job riêng lẻ sẽ nhận một item từ dữ liệu split. Nó sẽ đến trong [Job.input](data.md#job-input) của job, hoặc trong `data` dưới dạng thuộc tính tên `item`, hoặc dưới dạng [File](data.md#file) trong array `files`.

Split yêu cầu chính xác một kết nối output đến Event hoặc Job node mà nó sẽ chạy cho từng item. Concurrency và queue được kiểm soát bởi limit gắn vào node đó. Sau khi tất cả item hoàn thành, bạn có thể tiếp tục luồng bằng một dây `continue` từ node được điều khiển. Controller bao gồm cài đặt "continue percentage" để bạn có thể yêu cầu ít nhất N% sub-job phải thành công trước khi tiếp tục.

##### Split Item Filter

Bạn có thể tuỳ chọn lọc bỏ item khỏi array split, bằng cách bao gồm một expression lọc item đặc biệt. Trong context này dùng từ khoá đặc biệt `item` để chỉ item đang được lọc. Nếu expression của bạn được đánh giá là true, item sẽ được bao gồm trong tập kết quả. Nếu không, nó sẽ bị loại bỏ. Đây là một ví dụ dùng thuộc tính bên trong item:

```js
item.random < 0.5
```

Cũng có sẵn trong context này là `index` (chỉ số 0-based của item hiện tại trong tập), `workflow.params` (tất cả trường người dùng cấp workflow), và `workflowData` (object dữ liệu chia sẻ của workflow). Ví dụ, đây là cách lọc bỏ tất cả item lẻ, và chỉ giữ item chẵn, dùng toán tử modulo:

```js
index % 2 == 0
```

#### Join Controller

Join controller chờ nhiều luồng đến hoàn tất, sau đó chuyển một kết quả kết hợp đến bước tiếp theo. Bạn có thể nối nhiều input vào một Join; nó khởi tạo khi input đầu tiên đến và hoàn thành sau khi tất cả input của nó đã kích hoạt.

Quy trình gộp hoạt động như sau: tất cả dữ liệu job input được thêm vào một array `items`, và cũng riêng biệt tất cả dữ liệu job được shallow-merge vào một object `combined`, được chuyển đến job tiếp theo (qua điều kiện continue). Ví dụ, nếu 3 job input được kết nối đều xuất ra dữ liệu này: `{"foo":1234}` thì dữ liệu đã join cuối cùng được chuyển đi sẽ trông như sau:

```json
{
	"items": [
		{ "foo": 1234 },
		{ "foo": 1234 },
		{ "foo": 1234 }
	],
	"combined": {
		"foo": 1234
	}
}
```

Bất kỳ file được tạo ra ở upstream sẽ được nối lại và chuyển đi. Join yêu cầu chính xác một kết nối output.

#### Repeat Controller

Repeat controller chạy cùng một Event hoặc Job node một số lần cố định. Bạn cấu hình số lần lặp trên controller. Tất cả các lần chạy được khởi chạy ngay lập tức và sẽ xếp hàng hoặc chạy song song dựa trên limit gắn vào node đích. Repeat yêu cầu chính xác một kết nối output (đến node đang được lặp). Sau khi tất cả lần lặp hoàn thành, dùng một dây `continue` từ node được lặp để định nghĩa xử lý hậu kỳ.

Để kiểm soát chạy nối tiếp/song song của các job repeat, người dùng chỉ cần kết nối limit node vào event/job node, ví dụ "Max Concurrent Jobs" và "Max Queue Size".

Repeat controller cũng cung cấp trường văn bản "continue percentage", nơi người dùng có thể nhập một số từ 0-100. Đây đại diện cho số sub-job phải hoàn thành thành công để controller kích hoạt điều kiện "continue" và cho phép luồng tiếp tục (nếu không workflow sẽ kết thúc, giả sử không còn node khác đang active).

#### Multiplex Controller

Multiplex controller chạy một job trên nhiều server. Nó mở rộng việc chọn target từ Event/Job đích thành các server ID cụ thể, lọc theo server đang được bật, và áp dụng bộ lọc alert của server. Sau đó nó khởi chạy một sub-job cho mỗi server. Một cài đặt stagger tuỳ chọn sẽ trì hoãn các lần khởi chạy theo một khoảng cố định cho mỗi job, giúp tránh hiệu ứng "đàn trâu" (thundering herd). Multiplex yêu cầu chính xác một kết nối output (đến Event/Job sẽ chạy cho mỗi server).

Để kiểm soát chạy nối tiếp/song song của các job multiplex, người dùng chỉ cần kết nối limit node vào event/job node, ví dụ "Max Concurrent Jobs" và "Max Queue Size".

Multiplex controller cũng cung cấp trường văn bản "continue percentage", nơi người dùng có thể nhập một số từ 0-100. Đây đại diện cho số sub-job phải hoàn thành thành công để controller kích hoạt điều kiện "continue" và cho phép luồng tiếp tục (nếu không workflow sẽ kết thúc, giả sử không còn node khác đang active).

#### Decision Controller

Decision controller đánh giá một expression JEXL (với [phần mở rộng PTOps](xyexp.md)) dựa trên context job trước đó, ví dụ `data.random > 0.5`. Nếu expression được đánh giá là true, controller sẽ chuyển điều khiển đến tất cả output đã kết nối; khi false, không output nào kích hoạt. Không có cực "false" rõ ràng. Với logic đa nhánh, tạo nhiều Decision node với expression khác nhau và title/icon tuỳ chọn để làm rõ các nhánh một cách trực quan.

Trong UI, hộp thoại cấu hình decision controller cung cấp nút "Expression Builder", cho phép bạn khám phá output data từ các job hoàn thành gần đây, và chọn ra một đường dẫn JSON key cụ thể để dùng cho chuỗi expression.

Decision không yêu cầu một output duy nhất và có thể phân tán đến nhiều node.

#### Wait Controller

Wait controller tạm dừng luồng trong một khoảng thời gian đã cấu hình, sau đó chuyển điều khiển đến tất cả output đã kết nối. Nó duy trì trạng thái active khi đang chờ và bị huỷ nếu workflow bị huỷ.

Wait không yêu cầu một output duy nhất và có thể cấp cho nhiều bước downstream.

### Note Node

Note node đơn giản là một hộp văn bản có thể tuỳ chỉnh mà bạn có thể dùng để ghi chú workflow của mình. Nhập nội dung ghi chú bằng [GitHub Flavored Markdown](https://guides.github.com/features/mastering-markdown/), và nó sẽ hiển thị trên bản đồ workflow của bạn. Bạn có thể kéo ghi chú xung quanh để định vị chúng ở bất cứ đâu bạn muốn, và thậm chí làm một ghi chú rộng gấp đôi.

Theo mặc định, ghi chú không được hiển thị khi job chạy -- chúng chủ yếu để cung cấp hướng dẫn cho người dùng đang cấu hình workflow. Tuy nhiên, có một checkbox để luôn hiển thị ghi chú, ngay cả khi job đang chạy.

## Kết Nối và Điều Kiện

Đây là các quy tắc kết nối theo loại node:

- Trigger gửi luồng đến Event, Job, hoặc Controller node.
- Event và Job node nhận luồng từ Trigger, Event/Job, hoặc Controller node và có thể gửi đến Event/Job, Action, hoặc Controller node; cực limit dưới của chúng nhận Limit node.
- Action node chỉ kết nối từ Event/Job node.
- Limit node gắn vào cực dưới của Event/Job node.
- Controller nhận luồng từ Trigger/Event/Job node và gửi đến Event/Job node.

Hạn chế output của controller:

- Split, Join, Repeat, Multiplex: phải có chính xác một kết nối output (đến node đang được điều khiển hoặc node hậu-join).
- Decision và Wait: có thể có nhiều output.

Điều kiện trên dây từ Event/Job node quyết định output nào kích hoạt khi sub-job hoàn thành. Các giá trị được hỗ trợ bao gồm complete (luôn), success (mã 0), error (bất kỳ thất bại nào), các mã cụ thể warning, critical, hoặc abort, tag:NAME (kích hoạt nếu sub-job tạo ra tag NAME), và continue (một điều kiện đặc biệt kích hoạt sau khi Repeat/Multiplex/Split hoàn thành khi đạt ngưỡng thành công).

Trình chỉnh sửa mặc định các dây mới từ output của Event/Job thành success, và bạn có thể đổi điều kiện trực tiếp trên dây (chỉ cần nhấn vào nó). Lưu ý rằng Action và Limit node không chuyển tiếp luồng: chúng được gắn vào sub-job đã khởi chạy; action yêu cầu một điều kiện và limit gắn qua cực dưới.

## Luồng Resume Tuỳ Chỉnh

Khi một sub-job workflow bị suspend bởi một action hoàn thành, hộp thoại resume cho phép người dùng chọn cách luồng workflow nên tiếp tục sau khi job được resume. Tuỳ chọn mặc định resume bình thường, nghĩa là PTOps đánh giá kết quả sub-job đã hoàn thành và theo bất kỳ dây output khớp nào từ Event hoặc Job node hiện tại.

Người dùng cũng có thể chọn một Event hoặc Job node workflow cụ thể để nhảy đến. Trong chế độ này, PTOps khởi chạy node đã chọn ngay sau khi sub-job bị suspend được resume, thay vì theo các dây output khớp bình thường từ node bị suspend.

Bộ chọn này chỉ hiển thị khi sub-job workflow bị suspend đã ở cuối lifecycle job của nó. Nói cách khác, nó xuất hiện cho một action Suspend Job được nối với điều kiện hoàn thành như `On Complete`, `On Success`, `On Any Error`, `On Warning`, `On Critical`, `On Abort`, hoặc một điều kiện tag. Nó không hiển thị khi action Suspend Job kích hoạt ở đầu job, như `On Start`.

Hành vi tương tự có sẵn qua API [resume_job](api.md#resume_job) bằng cách truyền thuộc tính `redirect` tuỳ chọn với ID node workflow đích.

## Continue Sau Controller

[Repeat](#repeat-controller), [Multiplex](#multiplex-controller) và [Split](#split-controller) đặc biệt vì chúng khởi chạy cùng một Event hoặc Job node nhiều lần. Ví dụ, Repeat có thể chạy cùng một job 10 lần, Multiplex có thể chạy nó một lần cho mỗi server trong group đích, và Split có thể chạy nó một lần cho mỗi item hoặc file.

Điều này tạo ra một sự khác biệt quan trọng cho các dây đi ra từ event/job node được điều khiển:

- "On Success", "On Complete", "On Any Error" và điều kiện tag được đánh giá cho *mỗi sub-job riêng lẻ*. Nếu bạn nối một node khác dùng "On Success" hoặc "On Complete", nó có thể chạy nhiều lần, một lần cho mỗi sub-job khớp.
- "On Continue" chỉ được đánh giá *một lần duy nhất* cho toàn bộ controller. Nó chỉ kích hoạt sau khi tất cả job được khởi chạy bởi controller Repeat, Multiplex hoặc Split đó đã hoàn thành.

Dùng "On Continue" khi bạn muốn một bước tiếp theo duy nhất sau khi toàn bộ tập được điều khiển đã xong. Ví dụ:

```text
+-----------+     +-------+      -------------      +-------+
| Multiplex | --> | Job A | --> | On Continue | --> | Job B |
+-----------+     +-------+      -------------      +-------+
```

Dây "On Continue" được hàn từ Event hoặc Job node được điều khiển, không phải từ controller.

Trong ví dụ này, `Job A` chạy nhiều lần, một lần cho mỗi server được chọn. `Job B` chỉ chạy một lần, và chỉ sau khi mọi `Job A` được multiplex đã hoàn thành. Nếu điều kiện dây được đổi thành `On Success` hoặc `On Complete`, thì `Job B` sẽ chạy một lần cho mỗi `Job A` khớp.

Cài đặt "continue percentage" của controller kiểm soát liệu dây "On Continue" có được cho phép kích hoạt hay không. Đây là một số từ 0 đến 100, đại diện cho tỷ lệ tối thiểu các sub-job được điều khiển phải thành công. Sau khi sub-job cuối cùng hoàn tất, PTOps kiểm tra tỷ lệ thành công:

- Nếu tỷ lệ thành công đạt hoặc vượt cài đặt controller, tất cả dây "On Continue" từ Event hoặc Job node được điều khiển sẽ kích hoạt.
- Nếu tỷ lệ thành công thấp hơn cài đặt controller, các dây "On Continue" không kích hoạt, và workflow có thể kết thúc nếu không còn node khác đang active.

Mỗi điều kiện "On Continue" được giới hạn phạm vi cho cặp controller và Event/Job node cụ thể mà nó được gắn vào. Bạn có thể có nhiều phần controller trong cùng một workflow, và mỗi phần chờ các job được điều khiển của riêng nó trước khi kích hoạt các dây "On Continue" riêng.

## Replay Job Trước Đó

Event và Job node có thể được đặt để replay một job trước đó thay vì khởi chạy job mới. Điều này hữu ích khi test một workflow mà một bước đắt đỏ, chậm, bị giới hạn tốc độ, hoặc khó tái tạo. Ví dụ, bạn có thể chạy một truy vấn database hoặc yêu cầu AI một lần, sau đó replay kết quả đã lưu đó khi bạn tiếp tục làm việc trên các node downstream.

Để dùng tính năng này, sửa một Event hoặc Job node và chọn một job từ menu "Replay Previous Job". PTOps liệt kê các job workflow trước đó khớp với event hoặc plugin đã chọn. Sau khi bạn lưu node, đồ thị hiển thị một badge "Replay" trên header của node để bạn có thể nhanh chóng thấy node nào đang bị đóng băng.

Khi workflow đến một node được replay:

- PTOps không khởi chạy sub-job mới.
- Job trước đó đã chọn được nạp và xử lý như vừa hoàn thành cho node này.
- `data` output, `files` output, tag và `workflowData` của job trước đó được chuyển đến các node downstream.
- Kết quả của job trước đó cũng được giả lập, để `On Success`, `On Any Error`, `On Warning`, `On Critical`, `On Abort` và điều kiện tag theo cùng đường dẫn mà chúng đã theo ban đầu.

Action gắn trực tiếp vào node được replay, như email, web hook, action suspend, hoặc action tắt/xoá, sẽ không chạy lại. Chúng được coi là một phần của lifecycle job replay ban đầu, vậy chế độ replay chỉ đưa kết quả đã lưu trở lại luồng workflow.

## Chuyển Dữ Liệu Giữa Các Node

Input và output được tự động chuyển đi:

- Khi workflow bắt đầu, `input.data` và `input.files` đầu vào được chuyển đến trigger node. Trigger node chuyển tiếp chúng đến bất kỳ node được hàn nào.
- Khi một Event/Job hoàn thành, `data` và `files` output của nó được chuyển đến các node downstream dưới dạng `input.data` và `input.files`.
	- Lưu ý rằng script job của bạn phải chỉ định rõ đường dẫn dữ liệu và file cho output. Xem [Output Data](plugins.md#output-data) và [Output Files](plugins.md#output-files).
- Nếu workflow tự nó có bất kỳ trường người dùng nào được định nghĩa, chúng được chuyển đến tất cả sub-job qua một object `workflow.params` bên trong dữ liệu job.
- Tag: tag của người dùng từ sub-job trồi lên job workflow và có thể điều khiển điều kiện `tag:...`.
- Nội dung HTML và table: nếu một sub-job phát ra `html` hoặc `table`, nó trồi lên job cha để hiển thị. Nếu nhiều job phát ra nội dung, job sau sẽ chiếm ưu thế.
- Retry: nếu một sub-job đã bị retry, dữ liệu/file của nó không trồi lên và không tính vào việc kích hoạt tag/điều kiện.

Chi tiết về Join:

- Node tiếp theo sau một Join Controller nhận một `input.data` tuỳ chỉnh với hai thuộc tính: `items` (array dữ liệu của mỗi job upstream) và `combined` (shallow merge của tất cả dữ liệu).
- Bất kỳ file nào được nối vào array `input.files`.

Chi tiết về Split:

- Split controller giải quyết đường dẫn dữ liệu của nó dựa trên context job trước đó (hoặc input đến).
- Nếu đường dẫn là `files`, mỗi file đến được gửi đến một sub-job riêng biệt; nếu không, mỗi phần tử array trở thành `input.data = { item: ... }` cho sub-job được khởi chạy.

## Chia Sẻ Dữ Liệu Giữa Tất Cả Node

PTOps duy trì một object `workflowData` được chia sẻ trong suốt lần chạy workflow. Bất kỳ node nào có thể đọc hoặc ghi vào object này, khiến nó trở thành một cách thuận tiện để chia sẻ trạng thái giữa các node không được kết nối trực tiếp.

Để ghi vào `workflowData` từ trong job của bạn, xuất ra một object `workflowData` từ script Plugin của bạn (xem [Cập Nhật Server Data](plugins.md#server-data) để biết cú pháp tương tự). PTOps sẽ shallow-merge đối tượng đã xuất vào `workflowData` hiện có của workflow.

Bất kỳ node downstream nào sau đó có thể đọc từ object `workflowData` đã cập nhật.

Object `workflowData` chỉ tồn tại trong suốt thời gian chạy workflow. Nó không bền (persistent) như [Server User Data](servers.md#user-data), nhưng nó hoạt động theo cùng cách.

> [!TIP]
> Nếu bạn khởi chạy workflow qua API [run_event](api.md#run_event), bạn có thể điền sẵn object `workflowData` chỉ bằng cách bao gồm nó trong lệnh gọi API dưới dạng thuộc tính JSON cấp cao nhất.

## Event Node vs Job Node

Khi nào nên dùng Event Node so với Job Node:

- **Event node**: Tham chiếu một event đã tạo sẵn. Dùng cái này khi bạn muốn cấu hình tái sử dụng: tham số plugin, target, algo, action, limit, và trường người dùng tuỳ chọn. Node có thể override target, algo, tag, và tham số người dùng cho mỗi lần dùng.
- **Job node**: Job tùy biến không có event. Bạn chọn plugin và điền tham số plugin ngay trong trình chỉnh sửa workflow (ví dụ viết script shell nội tuyến với plugin Shell). Cách này nhanh hơn cho việc làm một lần hoặc khi bạn không muốn tạo event riêng.

## Sub-Workflow

Event node có thể tham chiếu event loại `workflow`. Để chạy như một sub-workflow:

- Sub-workflow phải có một trigger manual đã bật. Engine dùng cái này để xác định node bắt đầu.
- Input của workflow cha (data/file) được chuyển vào trigger node của sub-workflow.
- Limit và action trên workflow cha không tự động áp dụng cho sub-workflow trừ khi được gắn rõ vào node.

## Gợi Ý

- **Tái sử dụng vs. tùy biến**: Dùng Event node để đóng gói cấu hình ổn định và trường người dùng, và Job node cho việc làm một lần nhanh hoặc script nội tuyến.
- **Kiểm soát concurrency**: Mọi thứ chạy song song theo mặc định; gắn limit [Max Concurrent Jobs](limits.md#max-concurrent-jobs) và [Max Queue Limit](limits.md#max-queue-limit) để hạn chế fan-out.
- **Luồng hậu-controller**: Với Repeat/Multiplex/Split, dùng dây `continue` từ node được điều khiển để xử lý các bước "sau khi tất cả xong", tuỳ chọn với một ngưỡng thành công.
- **Fan-in**: Dùng Join để gộp nhiều kết quả upstream; node tiếp theo sẽ thấy cả `items` và một object `combined`.
- **Định tuyến điều kiện**: Ưu tiên dây `success`/`error` cho các đường chính và thêm `warning`, `critical`, `abort`, hoặc `tag:NAME` cho xử lý đặc biệt.
- **Logic điều kiện**: Dùng Decision cho phân nhánh; nhân bản node cho luồng đa nhánh và đặt title/icon rõ ràng cho mỗi nhánh.
- **Giãn cách (Staggering)**: Với job đa server quy mô lớn, thêm một Multiplex controller với stagger để tránh dồn tải.
- **Xử lý file**: Split trên `files` để xử lý mỗi file trong một sub-job; gộp kết quả với Join.
- **Replay khi test**: Dùng Replay trên Event/Job node đắt đỏ hoặc chậm để logic workflow downstream có thể được test lặp lại từ một kết quả đã lưu đã biết.

## Tham Chiếu Mô Hình Dữ Liệu

Workflow được lưu bên trong event. Xem [Data Structures](data.md) để biết schema đầy đủ. Điểm nổi bật:

- [Workflow](data.md#workflow): `{ start?, nodes: [], connections: [] }`.
- [Nodes](data.md#workflownode): `{ id, type: 'trigger'|'event'|'job'|'limit'|'action'|'controller', x, y, data? }`. Dữ liệu Event và Job node có thể bao gồm `replay`, chứa job ID trước đó cần replay.
- [Connections](data.md#workflowconnection): `{ id, source, dest, condition? }` trong đó `condition` khớp với danh sách điều kiện dây ở trên.
- Dữ liệu controller:
  - Multiplex: `{ controller: 'multiplex', stagger?, continue? }`
  - Repeat: `{ controller: 'repeat', repeat, continue? }`
  - Split: `{ controller: 'split', split: 'data.path.or.files', continue? }`
  - Join: `{ controller: 'join' }`
  - Decision: `{ controller: 'decision', decision: '<expression>' , title?, icon? }`
  - Wait: `{ controller: 'wait', wait }`

## Bảo Mật và Quyền

Tạo hoặc sửa một workflow phải tuân theo cùng quyền như event. Khi một workflow chạy sub-job, quyền target và category vẫn áp dụng cho các job đã khởi chạy đó.

Xem [Privileges](privileges.md) và [Events](events.md) để biết thêm chi tiết.

## API

Workflow tái sử dụng API của event -- không có API workflow riêng. Cụ thể:

- [get_events](api.md#get_events)
- [get_event](api.md#get_event)
- [create_event](api.md#create_event)
- [update_event](api.md#update_event)
- [run_event](api.md#run_event)
- [delete_event](api.md#delete_event)

Xem [API → Events](api.md#events) để biết chi tiết.

## Ghi Chú và Lưu Ý

- Yêu cầu output đơn của controller: controller Split, Join, Repeat, và Multiplex phải có chính xác một output.
- Trigger manual của sub-workflow: một sub-workflow phải có một trigger manual đã bật, nếu không nó không thể được khởi chạy từ một workflow node.
- Action/Limit node: chúng không chuyển tiếp luồng; chúng được merge vào sub-job đã khởi chạy và được thực thi/kiểm tra ở đó.
- Trigger bộ điều chỉnh: Catch-Up, Range, Blackout, Delay, Precision chỉ là bộ điều chỉnh trực quan và "sáng lên" khi lịch liên kết của chúng kích hoạt; chúng không kết nối với node khác.

## Xem Thêm

- [Events](events.md)
- [Actions](actions.md)
- [Limits](limits.md)
- [Triggers](triggers.md)
- [Plugins → Event Plugins](plugins.md)
- [PTOps Expression Format](xyexp.md)
