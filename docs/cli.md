# Command Line

## Tổng Quan

Dưới đây là tất cả các dịch vụ PTOps có sẵn cho bạn trên command line. Hầu hết các dịch vụ này được truy cập qua shell script sau:

```
/opt/xyops/bin/control.sh [COMMAND]
```

Dưới đây là tất cả các lệnh được hỗ trợ:

| Lệnh | Mô Tả |
|---------|-------------|
| `start` | Khởi động PTOps ở chế độ daemon. Xem [Starting and Stopping](CommandLine.md#starting-and-stopping). |
| `stop` | Dừng daemon PTOps và chờ thoát. Xem [Starting and Stopping](CommandLine.md#starting-and-stopping). |
| `restart` | Gọi `stop`, sau đó `start`, theo thứ tự. Xem [Starting and Stopping](CommandLine.md#starting-and-stopping). |
| `status` | Kiểm tra xem PTOps hiện có đang chạy hay không. Xem [Starting and Stopping](CommandLine.md#starting-and-stopping). |
| `admin` | Tạo tài khoản admin khẩn cấp mới (chỉ định user / pass). Xem [Recover Admin Access](CommandLine.md#recover-admin-access). |
| `grant` | Cấp một privilege cho user theo cách thủ công: `bin/control.sh grant USERNAME PRIVILEGE_ID`. |
| `revoke` | Thu hồi một privilege khỏi user theo cách thủ công: `bin/control.sh revoke USERNAME PRIVILEGE_ID`. |
| `upgrade` | Nâng cấp PTOps lên bản stable mới nhất (hoặc chỉ định version). Xem [Upgrading PTOps](#upgrading-ptops). |
| `version` | Xuất ra version package PTOps hiện tại và thoát. |
| `help` | Hiển thị danh sách các lệnh có sẵn và thoát. |

## Khởi Động và Dừng

Để khởi động dịch vụ, dùng lệnh `start`:

```
/opt/xyops/bin/control.sh start
```

Và để dừng nó, dùng lệnh `stop`:

```
/opt/xyops/bin/control.sh stop
```

Bạn cũng có thể dừng + khởi động nhanh với lệnh `restart`:

```
/opt/xyops/bin/control.sh restart
```

Lệnh `status` sẽ cho bạn biết dịch vụ có đang chạy hay không:

```
/opt/xyops/bin/control.sh status
```

## Khôi Phục Quyền Truy Cập Admin

Mất quyền truy cập vào tài khoản admin? Bạn có thể tạo một tài khoản administrator tạm thời mới trên command-line. Chỉ cần thực thi lệnh này trên server chính của bạn:

```
/opt/xyops/bin/control.sh admin USERNAME PASSWORD
```

Thay `USERNAME` bằng username mong muốn, và `PASSWORD` bằng password mong muốn cho tài khoản mới. Lưu ý rằng user mới sẽ không hiển thị trong danh sách chính của user trên UI. Nhưng bạn sẽ có thể đăng nhập bằng thông tin đăng nhập đã cung cấp. Đây chủ yếu là một biện pháp khẩn cấp, chỉ để cho phép bạn truy cập lại vào hệ thống. *Đây không phải là cách tốt để tạo user vĩnh viễn*. Sau khi đăng nhập lại được, bạn nên xem xét tạo một tài khoản khác từ UI, sau đó xóa tài khoản admin khẩn cấp.

Để khôi phục quyền truy cập admin trong môi trường container, bạn có thể dùng biến môi trường sau:

```
XYOPS_recover_admin="USERNAME:PASSWORD"
```

Việc này sẽ tạo tài khoản administrator khẩn cấp được chỉ định vào lần khởi động tiếp theo (khi conductor trở thành primary). Lưu ý rằng giống như phương pháp CLI, user mới sẽ không hiển thị trong danh sách chính của user trên UI. Nhưng bạn sẽ có thể đăng nhập bằng thông tin đăng nhập đã cung cấp. Đây chủ yếu là một biện pháp khẩn cấp, chỉ để cho phép bạn truy cập lại vào hệ thống. *Đây không phải là cách tốt để tạo user vĩnh viễn*. Sau khi đăng nhập lại được, bạn nên xem xét tạo một tài khoản khác từ UI, sau đó xóa tài khoản admin khẩn cấp.

Cũng đừng quên xóa biến môi trường này, nếu không PTOps sẽ tiếp tục tạo lại tài khoản mỗi lần restart!

Lưu ý rằng khôi phục quyền truy cập admin **không** hoạt động với [SSO](sso.md). Nó chỉ áp dụng cho các thiết lập dùng hệ thống quản lý user tích hợp sẵn. Nếu bạn mất quyền truy cập vào SSO IdP, bạn có thể tắt SSO trong cấu hình PTOps, sau đó dùng các lệnh trên để giành lại quyền truy cập admin.

## Khởi Động Cùng Server

Để đăng ký PTOps làm dịch vụ khởi động daemon nền (để nó tự động khởi động khi server reboot), gõ lệnh này:

```sh
cd /opt/xyops
npm run boot
```

Việc này được thực hiện qua module [pixl-boot](https://github.com/jhuckaby/pixl-boot), và nó hỗ trợ [Systemd](https://en.wikipedia.org/wiki/Systemd) nếu có sẵn, chuyển sang [Sysv Init](https://en.wikipedia.org/wiki/Init#SysV-style) hoặc [launchd](https://support.apple.com/guide/terminal/script-management-with-launchd-apdc6c1077b-5d5d-4d35-9c19-60f2397b2369/mac) trên macOS.

**Đối với người dùng Linux:** Khi đã đăng ký PTOps làm dịch vụ Systemd, bạn nên luôn khởi động / dừng nó bằng các lệnh `systemctl` thích hợp. Tên dịch vụ là `xyops.service`.

Nếu bạn đổi ý hoặc muốn gỡ cài đặt PTOps, bạn có thể hủy đăng ký dịch vụ khởi động bằng lệnh này:

```sh
cd /opt/xyops
npm run unboot
```

**Lưu Ý Quan Trọng:** Khi PTOps khởi động cùng server boot, nó thường không có môi trường user đầy đủ, tức là không có biến môi trường `PATH`. Vì vậy nếu script của bạn phụ thuộc vào các file thực thi binary ở vị trí không chuẩn, bạn có thể phải khôi phục `PATH` tuỳ chỉnh và các biến khác trong script của bạn bằng cách khai báo lại chúng.

## Nâng Cấp PTOps

Để nâng cấp PTOps, bạn có thể dùng lệnh `upgrade` tích hợp sẵn:

```
/opt/xyops/bin/control.sh upgrade
```

Việc này sẽ nâng cấp app và tất cả dependency lên bản stable mới nhất, nếu có bản mới. Nó không ảnh hưởng đến storage dữ liệu, user, hoặc cài đặt cấu hình của bạn. Tất cả những thứ đó sẽ được giữ lại và import vào version mới. Đối với cluster nhiều server, bạn cần lặp lại lệnh này trên mỗi server.

Ngoài ra, bạn có thể chỉ định chính xác version bạn muốn nâng cấp (hoặc hạ cấp) đến:

```
/opt/xyops/bin/control.sh upgrade 1.0.4
```

Nếu bạn nâng cấp lên version `HEAD`, việc này sẽ lấy bản mới nhất từ GitHub. Lưu ý rằng đây chủ yếu dành cho developer hoặc beta-tester, và có khả năng chứa bug. Sử dụng với rủi ro của riêng bạn:

```
/opt/xyops/bin/control.sh upgrade HEAD
```

## Database CLI

PTOps đi kèm một DB CLI đơn giản để bạn có thể thực thi các lệnh thô. Các response luôn ở định dạng JSON. Cái này chủ yếu dùng để debug và khắc phục sự cố. Lệnh này nằm ở đây:

```
/opt/xyops/bin/db-cli.js COMMAND INDEX ARG1, ARG2, ...
```

Để thực hiện một truy vấn tìm kiếm trên một database cụ thể:

```sh
/opt/xyops/bin/db-cli.js search tickets "status:open"
```

Để lấy một record đơn từ database:

```sh
/opt/xyops/bin/db-cli.js get alerts "amg6sl6z0cc"
```

Đây là công cụ dành cho developer ở cấp độ thấp, và yêu cầu kiến thức nâng cao về hệ thống database trong PTOps. Để tìm hiểu thêm, xem:

- File `/opt/xyops/internal/unbase.json`, mô tả tất cả các bảng database trong PTOps.
- Hệ thống database [Unbase](https://github.com/jhuckaby/pixl-server-unbase) cung cấp năng lượng cho PTOps.
- Tài liệu [cú pháp truy vấn](https://github.com/jhuckaby/pixl-server-storage/blob/master/docs/Indexer.md#simple-queries).
