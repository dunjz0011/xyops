# Cronicle

## Tổng Quan

Chương này dành cho người dùng [Cronicle](https://github.com/jhuckaby/cronicle), người tiền nhiệm tinh thần của PTOps. Nếu bạn đang có một bản cài đặt Cronicle, bạn có thể di chuyển toàn bộ dữ liệu sang PTOps, bật một chế độ tương thích đặc biệt cho khả năng liên thông (interop) Plugin của Cronicle, và nếu muốn, whitelabel UI để đưa lại tên và logo Cronicle.

## Điều Kiện Tiên Quyết

Trước khi bạn nhập dữ liệu Cronicle, hãy đảm bảo bạn đã [thêm tất cả worker server](servers.md#adding-servers) vào bản cài đặt PTOps của mình. Lý do là, event của Cronicle có thể nhắm mục tiêu server trực tiếp qua hostname của chúng, nhưng PTOps làm điều này khác đi. Điều quan trọng là phải có tất cả server trong cluster PTOps của bạn trước khi nhập, để code có thể khớp đúng target server Cronicle với server PTOps mới của bạn.

## Xuất Dữ Liệu

Theo hướng dẫn [Cronicle Data Export](https://github.com/jhuckaby/Cronicle/blob/master/docs/CommandLine.md#data-import-and-export) để xuất toàn bộ dữ liệu từ Cronicle.

## Nhập Dữ Liệu

Để nhập dữ liệu Cronicle vào PTOps, theo các bước sau:

1. Đăng nhập PTOps với vai trò quản trị viên.
2. Nhấn vào tab "**System**" ở sidebar.
3. Nhấn nút "**Import Data...**".
4. Trong menu "**File Format**", chọn "**Cronicle Data Format**".
5. Nhấn nút "**Choose File...**" và chọn file xuất dữ liệu Cronicle của bạn.

> [!WARNING]
> Thao tác nhập hàng loạt có tính phá hoại (destructive), sẽ xoá toàn bộ dữ liệu trong đường đi. Ngoài ra, việc này sẽ hủy tất cả job đang chạy, xoá tất cả job đang chờ trong queue, và scheduler sẽ tự động bị tạm dừng.

Khi quá trình hoàn tất, một thông báo sẽ xuất hiện ở góc dưới bên trái màn hình. Sau đó, bạn có thể nhấn vào tab "**Activity**" ở sidebar, tìm job nhập đã hoàn tất (thường là mục nằm trên cùng) và nhấn link "**Details...**" để xem báo cáo đầy đủ, bao gồm cảnh báo hoặc lỗi nếu có.

Trước khi bật lại scheduler, hãy đảm bảo tất cả Events, Categories, Server Groups, Plugins, Users, và API Keys của bạn đều đã chuyển sang gọn gàng. Kiểm tra lại privilege người dùng, và cài đặt event như multiplex, thông báo, giới hạn CPU/RAM, retry, v.v.

## Chế Độ Tương Thích Plugin

Cả PTOps và Cronicle đều giao tiếp với Plugin qua JSON trên STDIO, nhưng API có khác nhau đôi chút. PTOps yêu cầu mỗi message JSON phải có thuộc tính `xy` ở cấp cao nhất được đặt là `1`, cùng với các thuộc tính job khác. Ví dụ:

```json
{ "xy": 1, "progress": 0.5 }
```

Đây là cách PTOps phân biệt API của riêng nó với các JSON ngẫu nhiên khác có thể được phát ra bởi Plugin của bạn hoặc một sub-process. Ngược lại, Cronicle cơ bản chấp nhận bất kỳ message JSON nào nó tìm thấy, nếu nó có một hoặc nhiều thuộc tính mà nó nhận diện được:

```json
{ "progress": 0.5 }
```

Nếu bạn đã viết Plugin Cronicle sẵn có mà muốn di chuyển sang PTOps *mà không cần thay đổi code*, bạn có thể bật một chế độ tương thích đặc biệt. Khi bật, nó bỏ yêu cầu thuộc tính `xy`, và cũng nhận diện và chuyển đổi một số API Plugin đặc thù của Cronicle khác như `chain`, `chain_error`, `chain_data`, `notify_success` và `notify_fail`. Để bật chế độ tương thích, thêm thuộc tính `cronicle` đặt là `true` bên trong object [satellite.config](config.md#satellite-config).

Bạn cũng có thể đặt qua biến môi trường nếu muốn:

```
XYOPS_satellite__config__cronicle="true"
```

> [!NOTE]
> Thay đổi Satellite Configuration cần khởi động lại để thay đổi có hiệu lực trên tất cả server của bạn.

## Whitelabel UI

Nếu bạn muốn whitelabel UI của PTOps để nó giống Cronicle, bạn có thể thay đổi cả tên app "name" (dùng ở nhiều nơi khác nhau) và hình logo hiển thị ở góc trên bên trái. Để làm điều này, chỉnh sửa hai thuộc tính cấu hình sau: [client.name](config.md#client-name) và [client.logo_url](config.md#client-logo_url) với các giá trị override sau:

```json
"name": "Cronicle",
"logo_url": "/images/cronicle-logo.png"
```

Lưu ý các thuộc tính này nằm *trong* object `client`, trong file `config.json` của bạn.

Bạn cũng có thể override chúng qua biến môi trường nếu muốn:

```
XYOPS_client__name="Cronicle"
XYOPS_client__logo_url="/images/cronicle-logo.png"
```

Đảm bảo đường dẫn logo khớp với cài đặt [email_logo](config.md#email_logo) của bạn. Với chế độ logo email `inline` mặc định, đây phải là một web root path cục bộ dưới thư mục `htdocs` của PTOps, thường bắt đầu bằng `/`. Nếu bạn đặt `email_logo` là `link`, logo có thể là một URL ảnh thông thường.

## Multiplex Events

PTOps xử lý [multiplex event](https://github.com/jhuckaby/Cronicle/blob/master/docs/WebUI.md#multiplexing) (job chạy trên nhiều server song song) khác với Cronicle. Chúng giờ được triển khai như một phần của [Workflow](workflows.md), sử dụng [Multiplex Controller Node](workflows.md#multiplex-controller). Khi bạn nhập dữ liệu Cronicle có multiplex event, chúng sẽ tự động được chuyển đổi thành workflow, với event được thêm vào bên trong dưới dạng [Job Node](workflows.md#job-node).

Điều này có nghĩa trong thực tế là các multiplex event của bạn sẽ "hoạt động ngay" giống như trong Cronicle. Tuy nhiên, giờ bạn có nhiều tuỳ chọn hơn để tuỳ chỉnh. Trong trình chỉnh sửa workflow, bạn có thể gắn [Limiter Node](workflows.md#limiter-nodes) vào job node của bạn, kiểm soát số job có thể chạy song song, cho phép một số job xếp hàng chờ. Để làm điều này, thêm cả [Max Jobs Limiter](workflows.md#max-jobs-limiter), và [Max Queue Limiter](workflows.md#max-queue-limiter). Lưu ý mặc định không có giới hạn song song.

## Detached Jobs

PTOps không có khái niệm [detached job](https://github.com/jhuckaby/Cronicle/blob/master/docs/WebUI.md#detached-mode) như Cronicle. Lý do là, PTOps cài đặt một satellite binary nhỏ trên worker server của bạn, chạy 24x7 và không bao giờ cần restart. Và nếu bạn cần nâng cấp software satellite, quá trình được điều phối theo cách triển khai dần dần, và không bao giờ làm gián đoạn job đang chạy (mỗi worker server chờ tất cả job hoàn tất trước khi tự nâng cấp).

Ngoài ra, việc dừng dịch vụ PTOps chính không hủy bất kỳ job đang chạy nào. Chúng đều tiếp tục chạy headless, và nếu chúng hoàn tất khi conductor server PTOps vẫn đang down, chúng chỉ đơn giản chờ một conductor server lên trước khi báo cáo hoàn tất.

## Privilege Người Dùng

Privilege của User và API Key được tự động di chuyển sang PTOps, nhưng có vài ngoại lệ:

- Privilege người dùng **Toggle Scheduler** của Cronicle không tồn tại trong PTOps. Tính năng này vẫn tồn tại, nhưng chỉ giới hạn cho quản trị viên.
- Privilege `job_read_only` không được document của Cronicle không tồn tại trong PTOps. Thay vào đó, các tham số Plugin và Event riêng lẻ có thể được đánh dấu là "administrator locked" (chỉ admin mới ghi được), và tham số script của Shell Plugin được cấu hình sẵn theo cách này.
