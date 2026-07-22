# Bảo Mật

## Tổng Quan

Nhóm phát triển PTOps rất coi trọng vấn đề bảo mật. Do bản chất của việc PTOps được cài đặt trên các hạ tầng server quy mô lớn, nhiều quyết định được đưa ra với bảo mật là ưu tiên hàng đầu, và chúng tôi luôn hướng đến việc triển khai bảo mật ngay từ khâu thiết kế (security by design).

## Công bố lỗ hổng có phối hợp (Coordinated Vulnerability Disclosure)

PTOps áp dụng mô hình [công bố lỗ hổng có phối hợp](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure) khi xử lý các lỗ hổng bảo mật. Mô hình này trước đây được gọi là "responsible disclosure". Chúng tôi khuyến khích mạnh mẽ bất kỳ ai báo cáo lỗ hổng cho PTOps hoặc dự án khác nên tuân theo mô hình này, vì nó được xem là một thông lệ tốt (best practice) trong ngành bảo mật.

Nếu bạn tin rằng mình đã phát hiện một lỗ hổng bảo mật hoặc lỗi liên quan đến bảo mật trong PTOps, vui lòng liên hệ với chúng tôi một cách riêng tư qua một trong các phương thức liên hệ dưới đây. Vui lòng không mở issue công khai, không thông báo công khai, và không tiết lộ vấn đề này cho bên thứ ba.

Quy trình này giúp đảm bảo người dùng bị ảnh hưởng có cơ hội khắc phục vấn đề trước khi nó được công bố rộng rãi. Điều này giúp giảm thiểu việc mở rộng bề mặt tấn công (do cải thiện hiểu biết của kẻ tấn công) đối với các quản trị viên cẩn trọng, chỉ đơn giản qua hành động công khai lỗ hổng.

## Các Phương Thức Liên Hệ

Có nhiều phương thức liên hệ khác nhau, tuy nhiên điều quan trọng là bạn cần sử dụng đúng phương thức liên hệ bảo mật khi báo cáo một lỗ hổng hoặc lỗi liên quan đến bảo mật. Các phương thức này được ghi rõ dưới đây.

### GitHub Security

Người dùng có thể sử dụng hệ thống báo cáo lỗ hổng bảo mật của GitHub để [báo cáo lỗ hổng](https://github.com/pixlcore/xyops/security/advisories/new) một cách riêng tư. Đây là cách dễ dàng cho người dùng đã có tài khoản GitHub.

### Email

Người dùng có thể sử dụng địa chỉ email [security@pixlcore.com](mailto:security@pixlcore.com) để báo cáo lỗ hổng một cách riêng tư. Đây là cách dễ dàng cho người dùng không có tài khoản GitHub.

Tài khoản email này chỉ có thể được truy cập bởi các thành viên trong nhóm nòng cốt (core team), với mục đích tiếp nhận báo cáo về các lỗ hổng và vấn đề bảo mật trong mã nguồn PTOps.

## Quy Trình

1. Người dùng báo cáo riêng tư về một lỗ hổng tiềm ẩn.
2. Báo cáo được xác nhận đã tiếp nhận.
3. Báo cáo được xem xét để xác định có cần thêm thông tin hay không. Nếu cần:
   1. Người dùng được thông báo rằng cần bổ sung thêm thông tin.
   2. Người dùng bổ sung thêm thông tin một cách riêng tư.
   3. Quy trình quay lại bước 3, và chuyển sang bước 4 nếu thông tin bổ sung đã đủ.
4. Lỗ hổng được tái hiện (reproduce).
5. Lỗ hổng được vá (patch), và nếu có thể, người báo cáo lỗi được cấp quyền truy cập vào bản binary đã sửa, docker image, và git patch.
6. Bản vá được xác nhận đã khắc phục lỗ hổng.
7. Bản sửa lỗi được phát hành và người dùng được thông báo cần cập nhật ngay.
8. [Thông báo bảo mật (security advisory)](https://github.com/pixlcore/xyops/security/advisories) được công bố khi (điều nào xảy ra trước):
  - Thông tin CVE được công bố bởi [MITRE](https://www.mitre.org/), [NIST](https://www.nist.gov/), v.v.
  - Khoảng 7 ngày sau khi người dùng đã được thông báo rằng bản cập nhật đã có sẵn.

## Ghi Nhận Công

Người dùng báo cáo lỗi sẽ được ghi nhận công phát hiện theo quyết định của họ (nghĩa là họ không bắt buộc phải được ghi nhận nếu muốn giữ ẩn danh). Việc ghi nhận này xuất hiện cả trong [thông báo bảo mật](https://github.com/pixlcore/xyops/security/advisories) và trong tài liệu của chúng tôi.
