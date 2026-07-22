# Chính Sách Bảo Mật PTOps

**Cập nhật lần cuối:** 22 Tháng 3, 2026

PixlCore LLC ("PixlCore", "chúng tôi", hoặc "của chúng tôi") tôn trọng quyền riêng tư của bạn. Chính Sách Bảo Mật này giải thích thông tin nào chúng tôi thu thập, cách chúng tôi sử dụng nó, và cách chúng tôi xử lý dữ liệu liên quan đến phần mềm PTOps và website của chúng tôi.

## 1. Tổng Quan

PTOps là phần mềm tự triển khai (self-hosted).

PixlCore không vận hành, host, hoặc kiểm soát các triển khai PTOps của Khách hàng. Theo thiết kế, PTOps không truyền dữ liệu đến PixlCore hoặc bất kỳ bên thứ ba nào do PixlCore vận hành.

## 2. Dữ Liệu Được Thu Thập Bởi Phần Mềm PTOps

PixlCore **không** thu thập, nhận, lưu trữ, hoặc xử lý bất kỳ dữ liệu nào từ các bản triển khai PTOps của Khách hàng.

Cụ thể:

- PTOps không bao gồm telemetry, phân tích (analytics), hoặc theo dõi (tracking)
- PTOps không "gọi về" máy chủ của PixlCore
- PTOps không truyền dữ liệu sử dụng, log, hoặc metric đến PixlCore

Tất cả dữ liệu được xử lý bởi PTOps vẫn hoàn toàn nằm trong hạ tầng riêng của Khách hàng.

Khách hàng hoàn toàn chịu trách nhiệm về tất cả dữ liệu được lưu trữ hoặc xử lý trong bản triển khai của họ.

## 3. Các Yêu Cầu Mạng Bên Ngoài

### 3.1 Cập Nhật Phần Mềm

PTOps có thể thực hiện các yêu cầu ra ngoài đến dịch vụ bên thứ ba (như GitHub) để kiểm tra hoặc tải xuống các bản cập nhật.

- Các yêu cầu này được khởi xướng bởi Khách hàng hoặc quản trị viên hệ thống
- PixlCore không nhận hoặc thu thập dữ liệu từ các yêu cầu này

### 3.2 Plugin Marketplace

PTOps có thể hỗ trợ các plugin do bên thứ ba hoặc cộng đồng phát triển ("Plugin Marketplace").

- Không có Plugin Marketplace nào được cài đặt theo mặc định
- Chỉ mục Plugin Marketplace được host hoàn toàn trên GitHub, và chỉ được yêu cầu theo nhu cầu
- Plugin, sau khi được cài đặt, có thể thực hiện các yêu cầu mạng ra ngoài của riêng chúng đến các dịch vụ bên ngoài
- Hành vi như vậy được xác định bởi plugin đó, không phải PixlCore
- Tài liệu của mỗi plugin nên mô tả hành vi của nó

PixlCore không chịu trách nhiệm về các thực hành dữ liệu của plugin bên thứ ba.

Khách hàng nên xem lại tài liệu của plugin trước khi cài đặt hoặc sử dụng plugin.

## 4. Thông Tin Được Thu Thập Bởi PixlCore

PixlCore có thể thu thập thông tin hạn chế trong các trường hợp sau:

### 4.1 Sử Dụng Website

Khi bạn truy cập website của chúng tôi, chúng tôi có thể thu thập thông tin cơ bản như:

- Địa chỉ IP
- Loại trình duyệt
- Các trang đã truy cập

Thông tin này được sử dụng cho việc vận hành website, an ninh, và phân tích tiêu chuẩn.

### 4.2 Hỗ Trợ Và Liên Lạc

Nếu bạn liên hệ với chúng tôi (ví dụ: qua email):

- Chúng tôi thu thập thông tin bạn cung cấp
- Điều này có thể bao gồm tên, địa chỉ email, tên công ty, và nội dung tin nhắn của bạn

Thông tin này chỉ được sử dụng để phản hồi yêu cầu của bạn và cung cấp hỗ trợ.

### 4.3 Thanh Toán Và Hoá Đơn

Khi bạn mua Support:

- Việc xử lý thanh toán được thực hiện bởi các nhà cung cấp bên thứ ba (ví dụ: Polar.sh, Stripe)
- PixlCore có thể nhận thông tin liên quan đến thanh toán như:
  - Tên
  - Địa chỉ email
  - Tên công ty
  - Chi tiết giao dịch

PixlCore không lưu trữ thông tin đầy đủ về thẻ thanh toán hoặc thông tin ngân hàng.

## 5. Cách Chúng Tôi Sử Dụng Thông Tin

PixlCore sử dụng thông tin đã thu thập để:

- Cung cấp dịch vụ Support
- Xử lý thanh toán và quản lý đăng ký
- Phản hồi các yêu cầu
- Cải thiện website và dịch vụ của chúng tôi

Chúng tôi không bán dữ liệu cá nhân.

## 6. Chia Sẻ Dữ Liệu

PixlCore không chia sẻ dữ liệu của Khách hàng từ các bản triển khai PTOps (vì chúng tôi không nhận bất kỳ dữ liệu nào).

Chúng tôi có thể chia sẻ thông tin hạn chế với:

- Các nhà xử lý thanh toán (ví dụ: Stripe, Polar.sh)
- Các nhà cung cấp dịch vụ cần thiết để vận hành doanh nghiệp của chúng tôi

Các nhà cung cấp này chỉ được cung cấp thông tin cần thiết để thực hiện dịch vụ của họ.

## 7. Lưu Giữ Dữ Liệu

Chúng tôi chỉ lưu giữ thông tin cá nhân trong thời gian cần thiết để:

- Cung cấp dịch vụ
- Tuân thủ các nghĩa vụ pháp lý
- Giải quyết tranh chấp

## 8. An Ninh Dữ Liệu

Chúng tôi thực hiện các biện pháp hợp lý để bảo vệ thông tin mà chúng tôi thu thập.

Tuy nhiên, Khách hàng chịu trách nhiệm bảo mật hạ tầng và dữ liệu riêng của họ trong các bản triển khai PTOps của họ.

## 9. Quyền Của Bạn

Tùy thuộc vào vị trí của bạn, bạn có thể có quyền:

- Truy cập dữ liệu cá nhân của bạn
- Yêu cầu chỉnh sửa hoặc xoá
- Phản đối một số hoạt động xử lý nhất định

Để thực hiện các quyền này, liên hệ với chúng tôi tại support@pixlcore.com.

## 10. Dịch Vụ Bên Thứ Ba

Chính Sách Bảo Mật này không áp dụng cho các dịch vụ bên thứ ba, bao gồm:

- Plugin Marketplace
- API hoặc dịch vụ bên ngoài được Khách hàng sử dụng
- Nhà xử lý thanh toán

Khách hàng nên xem lại chính sách bảo mật của các dịch vụ đó.

## 11. Quyền Riêng Tư Của Trẻ Em

PTOps không nhằm mục đích sử dụng bởi trẻ em dưới 13 tuổi, và chúng tôi không cố ý thu thập dữ liệu cá nhân từ trẻ em.

## 12. Thay Đổi Chính Sách Này

Chúng tôi có thể cập nhật Chính Sách Bảo Mật này theo thời gian.

Tất cả các phiên bản trước đây của tài liệu này có sẵn trực tuyến: https://github.com/pixlcore/xyops/blob/main/docs/privacy.md

Việc tiếp tục sử dụng website hoặc dịch vụ của chúng tôi sau khi có thay đổi đồng nghĩa với việc chấp nhận chính sách đã cập nhật.

## 13. Liên Hệ

```
PixlCore LLC
131 Continental Dr, Suite 305, Newark, DE 19713
+1 (707) 733-3328
support@pixlcore.com
```
