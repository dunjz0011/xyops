# Thiết lập bộ lưu trữ

PTOps được xây dựng dựa trên module [pixl-server-storage](https://github.com/jhuckaby/pixl-server-storage), và sử dụng nó làm cả cơ sở dữ liệu và lưu trữ file thông thường. Nó hỗ trợ nhiều "engine" back-end để xử lý dữ liệu I/O cơ sở, bao gồm một engine [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid) đặc biệt để chia tách dữ liệu và các file trên hai nhà cung cấp khác nhau.

Điều này rất quan trọng vì PTOps có **hai khối lượng công việc lưu trữ rất khác nhau**:

- **Dữ liệu**: Rất nhiều bản ghi JSON nhỏ, được sử dụng trong danh sách, hash, index, dữ liệu job, dữ liệu monitoring và siêu dữ liệu (metadata) ứng dụng nói chung.
- **File**: Các file của bucket, file đính kèm ticket, file upload của user, avatar, file của job, log của job được nén, và các payload nhị phân khác.

Một số engine về mặt kỹ thuật có thể phục vụ cả hai vai trò, nhưng PTOps hoạt động tốt nhất khi mỗi khối lượng công việc được đặt trên bộ lưu trữ phù hợp với nó. Đối với môi trường production thực tế, đặc biệt là với nhiều conductor, khuyến nghị chính thức là cấu hình [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid): sử dụng Redis hoặc Postgres cho dữ liệu JSON, và sử dụng S3 hoặc dịch vụ tương thích S3 cho các file nhị phân.

Điều này rất quan trọng đối với các giao dịch (transaction). SQLite, Postgres, và Redis hỗ trợ các transaction engine native trong pixl-server-storage. Khi một trong các engine này là `docEngine` của Hybrid, các commit transaction sẽ được xử lý bên trong chính cơ sở dữ liệu. Nếu một conductor bị crash trong quá trình commit và một conductor dự phòng tiếp quản, cơ sở dữ liệu sẽ sở hữu quyết định commit hoặc rollback cuối cùng. Các engine không có hỗ trợ transaction native vẫn sử dụng hệ thống log rollback cục bộ của pixl-server-storage, điều đó có nghĩa là conductor ban đầu có thể cần thiết để khôi phục sau một cú crash nghiêm trọng.

Nhìn chung:

| Engine / Nhà cung cấp | Tốt cho dữ liệu | Transaction native | Tốt cho file | Lưu ý |
|-------------------|---------------|---------------------|----------------|-------|
| Filesystem | - | - | ✅ | Tốt cho các file cục bộ, nhưng không được chia sẻ giữa các conductor. |
| NFS | - | - | ✅ | Chỉ khuyến nghị cho các file nhị phân, không phù hợp cho khối lượng công việc bản ghi JSON nhỏ. |
| AWS S3 | - | - | ✅ | Xuất sắc cho các file, nhưng độ trễ quá lớn đối với lưu lượng cơ sở dữ liệu của PTOps. |
| Tương thích S3, như MinIO hoặc RustFS | Có thể | - | ✅ | Lớp lưu trữ file tuyệt vời, nhưng không được khuyến nghị làm engine dữ liệu tất-cả-trong-một cho production đa conductor. |
| Redis | ✅ | ✅ | - | Tuyệt vời cho các bản ghi nhỏ, không phù hợp cho các file nhị phân thông thường. |
| SQLite | ✅ | ✅ | - | Kho lưu trữ tài liệu cục bộ tuyệt vời, nhưng chỉ dành cho máy host đơn lẻ. |
| Postgres | ✅ | ✅ | - | Kho lưu trữ tài liệu chia sẻ tốt, nhưng không lý tưởng cho các file lớn. |

Đối với các triển khai đơn conductor, nghĩa là phát triển (development), kiểm thử (testing), lab gia đình và các công cụ nội bộ nhỏ, cấu hình mặc định là [SQLite và Filesystem](#sqlite-and-filesystem) vẫn là lựa chọn tốt nhất. Đối với môi trường production thực tế và đặc biệt là đối với triển khai đa conductor, các cấu hình được khuyến nghị hiện nay là:

1. [Redis và S3](#redis-and-s3), hoặc một dịch vụ tương thích S3 như MinIO hoặc RustFS.
2. [Postgres và S3](#postgres-and-s3), hoặc một dịch vụ tương thích S3 như MinIO hoặc RustFS.

## Quy tắc ngón tay cái (Rules of Thumb)

- Đối với **một conductor duy nhất**, hãy sử dụng thiết lập mặc định [SQLite và Filesystem](#sqlite-and-filesystem) trừ khi bạn có lý do rõ ràng để thay đổi nó.
- Đối với **đa conductor** và/hoặc production thực tế, bạn cần bộ lưu trữ ngoài dùng chung cho tất cả các conductor. SQLite cục bộ cộng với đĩa cục bộ là không đủ.
- Đối với **production thực tế đa conductor**, hãy ưu tiên **Redis + S3** hoặc **Postgres + S3** thông qua engine [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid).
- Nếu endpoint S3 của bạn nằm trong mạng nội bộ (on premises), chẳng hạn như **MinIO** hoặc **RustFS**, hãy sử dụng nó làm `binaryEngine` của Hybrid cho các file, trong khi Redis hoặc Postgres vẫn là `docEngine` cho dữ liệu.
- Giữ cho [Storage.transactions](config.md#storage-transactions) được bật bất kể bạn chọn (các) engine nào.
- Giữ các conductor của bạn càng gần càng tốt với engine lưu trữ xử lý dữ liệu. Độ trễ là rất quan trọng đối với PTOps.

## Các cấu hình phổ biến

### SQLite và Filesystem

> [!TIP]
> Đây là cấu hình lưu trữ mặc định đi kèm với PTOps. Nó sẽ hoạt động tốt cho bất kỳ thiết lập conductor đơn lẻ nào.

Cấu hình này tận dụng engine [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid) để sử dụng [SQLite](https://github.com/jhuckaby/pixl-server-storage#sqlite) cho cơ sở dữ liệu, và [Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem) cho việc lưu trữ file nói chung. Ví dụ thiết lập:

```json
{
	"engine": "Hybrid",

	"Hybrid": {
		"docEngine": "SQLite",
		"binaryEngine": "Filesystem"
	},

	"Filesystem": {
		"base_dir": "data",
		"key_namespaces": 1
	},
	"SQLite": {
		"base_dir": "data",
		"filename": "sqlite.db",
		"pragmas": {
			"auto_vacuum": 0,
			"cache_size": -100000,
			"journal_mode": "WAL"
		},
		"cache": {
			"enabled": true,
			"maxItems": 100000,
			"maxBytes": 104857600
		},
		"backups": {
			"enabled": true,
			"dir": "data/backups",
			"filename": "backup-[yyyy]-[mm]-[dd]-[hh]-[mi]-[ss].db",
			"compress": true,
			"keep": 7
		}
	}
}
```

Sử dụng cấu hình này khi:

- Bạn chỉ có một conductor duy nhất.
- Bạn muốn một thiết lập đơn giản nhất có thể.
- Cơ sở dữ liệu và lưu trữ file của bạn đều có thể nằm trên cùng một đĩa cục bộ.

Nhược điểm của cấu hình này là nó chỉ hỗ trợ một conductor duy nhất. Cơ sở dữ liệu là cục bộ đối với máy host đó, vì vậy không có gì để một conductor khác chia sẻ.

Xem thêm:

- [Engine Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid)
- [Engine SQLite](https://github.com/jhuckaby/pixl-server-storage#sqlite)
- [Engine Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem)

### SQLite và NFS

Cấu hình này rất giống với [SQLite và Filesystem](#sqlite-and-filesystem), ngoại trừ việc `base_dir` của engine Filesystem trỏ đến một điểm mount NFS. Ngược lại, `base_dir` của engine SQLite nên trỏ đến một thư mục cục bộ *không* mount NFS. Cuối cùng, các bản backup SQLite có thể trỏ đến điểm mount NFS nếu bạn muốn giữ một bản sao ngoài máy host conductor.

Giả định:

- `/mnt/xyops` là điểm mount NFS của bạn.
- `/data/xyops` là thư mục cục bộ có đủ dung lượng đĩa cho SQLite.

Ví dụ thiết lập:

```json
{
	"engine": "Hybrid",
	"Hybrid": {
		"docEngine": "SQLite",
		"binaryEngine": "Filesystem"
	},
	"Filesystem": {
		"base_dir": "/mnt/xyops",
		"key_namespaces": 1
	},
	"SQLite": {
		"base_dir": "/data/xyops",
		"filename": "sqlite.db",
		"pragmas": {
			"auto_vacuum": 0,
			"cache_size": -100000,
			"journal_mode": "WAL"
		},
		"cache": {
			"enabled": true,
			"maxItems": 100000,
			"maxBytes": 104857600
		},
		"backups": {
			"enabled": true,
			"dir": "/mnt/xyops/db-backups",
			"filename": "backup-[yyyy]-[mm]-[dd]-[hh]-[mi]-[ss].db",
			"compress": true,
			"keep": 7
		}
	}
}
```

Sử dụng cấu hình này khi:

- Bạn chỉ có một conductor duy nhất.
- Bạn muốn lưu trữ file trên một NAS hoặc volume chia sẻ.
- Bạn vẫn muốn SQLite nằm trên đĩa cục bộ tốc độ cao.

Nhược điểm của cấu hình này là nó vẫn chỉ hỗ trợ một conductor duy nhất, vì cơ sở dữ liệu SQLite nằm cục bộ trên một máy. Ngoài ra, nếu bạn mất conductor do lỗi đĩa cục bộ, bạn sẽ cần khôi phục từ một bản backup SQLite. Các bản backup đó được ghi hàng ngày, vì vậy có thể xảy ra mất mát dữ liệu giữa lần backup cuối cùng và thời điểm xảy ra sự cố.

Xem thêm:

- [Engine Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid)
- [Engine SQLite](https://github.com/jhuckaby/pixl-server-storage#sqlite)
- [Engine Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem)

### MinIO

> [!WARNING]
> Trước khi áp dụng MinIO, hãy xem xét kỹ lưỡng tình trạng bản quyền, đóng gói và hỗ trợ hiện tại của nó. MinIO vẫn là một lựa chọn kỹ thuật tuyệt vời cho PTOps, nhưng [bối cảnh dự án đã thay đổi](https://www.chainguard.dev/unchained/secure-and-free-minio-chainguard-containers) gần đây.

MinIO là một kho lưu trữ file tương thích S3 tuyệt vời cho PTOps. Nó thường được triển khai on premises, gần các conductor, vì vậy nó có thể cung cấp lưu trữ nhị phân độ trễ thấp cho các file bucket, file đính kèm ticket, file upload của user, file job, và log của job được nén.

Đối với môi trường production thực tế đa conductor, hãy sử dụng MinIO làm `binaryEngine` của Hybrid, chứ không phải là engine lưu trữ tất-cả-trong-một. Hãy ghép nối nó với [Redis](#redis-and-s3) hoặc [Postgres](#postgres-and-s3) làm `docEngine`, để các transaction JSON sử dụng các commit cơ sở dữ liệu native.

Dưới đây là hướng dẫn khởi động nhanh để đưa MinIO vào hoạt động. Đầu tiên, hãy tạo một volume Docker để lưu trữ dữ liệu MinIO của bạn:

```sh
docker volume create minio-data
```

Tiếp theo, tải xuống và chạy container [Chainguard MinIO](https://images.chainguard.dev/directory/image/minio/overview), liên kết với volume dữ liệu mới:

```sh
docker run --detach --name minio -p 9000:9000 -p 9001:9001 -v minio-data:/data cgr.dev/chainguard/minio:latest server /data --console-address ":9001"
```

Nếu bạn cũng đang chạy PTOps trong Docker trên cùng một máy, bạn sẽ cần [tạo một mạng Docker](https://docs.docker.com/engine/network/) và thêm cả hai container vào cùng một mạng để chúng có thể giao tiếp với nhau.

Mở giao diện web MinIO trong trình duyệt của bạn bằng cách truy cập `http://MINIO_HOSTNAME:9001`. Đăng nhập bằng username và password admin MinIO mặc định cho một bản cài đặt mới, sau đó thay đổi chúng ngay lập tức:

- **Username**: `minioadmin`
- **Password**: `minioadmin`

Tạo một bucket mới, ví dụ `xydata`.

Sau đó tắt hoàn toàn PTOps, và cấu hình lại các object [Storage.AWS](config.md#storage-aws) và [Storage.S3](config.md#storage-s3) của bạn như sau:

```json
"AWS": {
	"endpoint": "http://MINIO_HOSTNAME:9000",
	"endpointPrefix": false,
	"forcePathStyle": true,
	"hostPrefixEnabled": false,
	"region": "us-west-1",
	"credentials": {
		"accessKeyId": "YOUR_MINIO_USERNAME",
		"secretAccessKey": "YOUR_MINIO_PASSWORD"
	}
},
"S3": {
	"connectTimeout": 5000,
	"socketTimeout": 5000,
	"maxAttempts": 50,
	"keyPrefix": "xyops/",
	"fileExtensions": true,
	"params": {
		"Bucket": "YOUR_MINIO_BUCKET_ID"
	},
	"cache": {
		"enabled": true,
		"maxItems": 100000,
		"maxBytes": 104857600
	}
}
```

Để thử nghiệm ban đầu, bạn có thể đặt `accessKeyId` và `secretAccessKey` thành các giá trị mặc định của MinIO, nhưng bạn nên thay thế chúng trước khi đưa vào production.

Cuối cùng, đặt [Storage.engine](config.md#storage-engine) thành `Hybrid`, đặt `binaryEngine` của Hybrid thành `S3`, và chọn `Redis` hoặc `Postgres` làm `docEngine` của Hybrid. Xem mục [Redis và S3](#redis-and-s3) và [Postgres và S3](#postgres-and-s3) để biết các ví dụ đầy đủ.

Vai trò cấu hình này:

- MinIO xử lý các file nhị phân thông qua engine S3.
- Tất cả các conductor có thể chia sẻ cùng một backend.
- Redis hoặc Postgres xử lý các bản ghi JSON và các commit transaction native.
- Điều này tránh việc phụ thuộc vào các log rollback cục bộ của conductor cho các giao dịch cơ sở dữ liệu production.

Xem mục [Di chuyển dữ liệu](#migration) bên dưới để biết cách di chuyển dữ liệu giữa các engine lưu trữ.

### RustFS

[RustFS](https://rustfs.com/) cũng là một kho lưu trữ file tương thích S3 tuyệt vời cho PTOps. Giống như MinIO, nó có thể được host on premises và đặt gần các conductor, làm cho nó trở thành một `binaryEngine` của Hybrid tuyệt vời cho các file.

Đối với môi trường production thực tế đa conductor, hãy sử dụng RustFS làm lớp lưu trữ file tương thích S3, và ghép nối nó với [Redis](#redis-and-s3) hoặc [Postgres](#postgres-and-s3) cho dữ liệu JSON và các commit transaction native.

Dưới đây là hướng dẫn khởi động nhanh để đưa RustFS vào hoạt động. Lưu ý rằng tính đến thời điểm viết bài này, RustFS vẫn còn tương đối mới, vì vậy hãy kiểm tra kỹ lưỡng trong môi trường của riêng bạn trước khi đưa nó vào một hệ thống production quan trọng.

Đầu tiên, tạo một volume Docker để lưu trữ dữ liệu RustFS của bạn:

```sh
docker volume create rustfs-data
```

Tiếp theo, tải xuống và chạy container RustFS chính thức, liên kết với volume dữ liệu mới:

```sh
docker run -d --name rustfs -p 9000:9000 -p 9001:9001 -v rustfs-data:/data rustfs/rustfs:latest
```

Nếu bạn cũng đang chạy PTOps trong Docker trên cùng một máy, bạn sẽ cần [tạo một mạng Docker](https://docs.docker.com/engine/network/) và thêm cả hai container vào cùng một mạng để chúng có thể giao tiếp với nhau.

Mở giao diện web RustFS trong trình duyệt của bạn bằng cách truy cập `http://RUSTFS_HOSTNAME:9001`. Đăng nhập bằng username và password admin RustFS mặc định, sau đó thay đổi chúng ngay lập tức:

- **Username**: `rustfsadmin`
- **Password**: `rustfsadmin`

Tạo một bucket mới, ví dụ `xydata`.

Tạo một access key mới, và lưu lại cả key và secret.

Sau đó tắt hoàn toàn PTOps, và cấu hình lại các object [Storage.AWS](config.md#storage-aws) và [Storage.S3](config.md#storage-s3) của bạn như sau:

```json
"AWS": {
	"endpoint": "http://RUSTFS_HOSTNAME:9000",
	"endpointPrefix": false,
	"forcePathStyle": true,
	"hostPrefixEnabled": false,
	"region": "us-west-1",
	"credentials": {
		"accessKeyId": "YOUR_RUSTFS_ACCESS_KEY",
		"secretAccessKey": "YOUR_RUSTFS_SECRET_KEY"
	}
},
"S3": {
	"connectTimeout": 5000,
	"socketTimeout": 5000,
	"maxAttempts": 50,
	"keyPrefix": "xyops/",
	"fileExtensions": true,
	"params": {
		"Bucket": "YOUR_RUSTFS_BUCKET_ID"
	},
	"cache": {
		"enabled": true,
		"maxItems": 100000,
		"maxBytes": 104857600
	}
}
```

Cuối cùng, đặt [Storage.engine](config.md#storage-engine) thành `Hybrid`, đặt `binaryEngine` của Hybrid thành `S3`, và chọn `Redis` hoặc `Postgres` làm `docEngine` của Hybrid. Xem mục [Redis và S3](#redis-and-s3) và [Postgres và S3](#postgres-and-s3) để biết các ví dụ đầy đủ.

Vai trò cấu hình này:

- RustFS xử lý các file nhị phân thông qua engine S3.
- Tất cả các conductor có thể chia sẻ cùng một backend.
- Redis hoặc Postgres xử lý các bản ghi JSON và các commit transaction native.
- Điều này tránh việc phụ thuộc vào các log rollback cục bộ của conductor cho các giao dịch cơ sở dữ liệu production.

Xem mục [Di chuyển dữ liệu](#migration) bên dưới để biết cách di chuyển dữ liệu giữa các engine lưu trữ.

### Redis và NFS

Cấu hình này sử dụng [Redis](https://github.com/jhuckaby/pixl-server-storage#redis) cho các bản ghi JSON và [Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem) trỏ đến một điểm mount NFS cho các file nhị phân. Đây là một tùy chọn production vững chắc nếu bạn đã vận hành Redis một cách đáng tin cậy và đã có một dịch vụ NAS hoặc NFS cho các file chia sẻ.

Giả định:

- `redis.internal.mycompany.com` là host Redis của bạn.
- `/mnt/xyops` là điểm mount NFS hiển thị cho tất cả các conductor.
- Tính năng persistence của Redis đã được bật, nghĩa là RDB và/hoặc AOF.

Ví dụ thiết lập:

```json
{
	"engine": "Hybrid",
	"Hybrid": {
		"docEngine": "Redis",
		"binaryEngine": "Filesystem"
	},
	"Redis": {
		"host": "redis.internal.mycompany.com",
		"port": 6379,
		"keyPrefix": "xyops/",
		"keyTemplate": "",
		"cache": {
			"enabled": true,
			"maxItems": 100000,
			"maxBytes": 104857600
		}
	},
	"Filesystem": {
		"base_dir": "/mnt/xyops",
		"key_namespaces": 1
	}
}
```

Sử dụng cấu hình này khi:

- Bạn đã tin tưởng Redis cho dữ liệu key/value độ trễ thấp.
- Bạn đã có bộ lưu trữ NFS chia sẻ cho các file.
- Bạn muốn hỗ trợ đa conductor mà không cần đưa vào một dịch vụ S3 on-premises.

Đánh đổi:

- Giờ đây bạn phải vận hành hai hệ thống lưu trữ khác nhau thay vì một.
- NFS chỉ được khuyến nghị cho các file nhị phân, không phù hợp cho khối lượng công việc tài liệu.
- Redis phải được cấu hình persistence, nếu không một lượt restart có thể trở thành sự kiện mất mát dữ liệu.
- Lưu lượng file lớn vẫn phụ thuộc vào hiệu suất NFS và sự ổn định của điểm mount.

Nếu bạn đang bắt đầu lại từ đầu on premises, hãy ưu tiên chọn [Redis và S3](#redis-and-s3) hoặc [Postgres và S3](#postgres-and-s3). MinIO hoặc RustFS là các lựa chọn tương thích S3 tốt cho phía lưu trữ file.

### Redis và S3

Cấu hình này sử dụng Redis cho các bản ghi JSON và S3 cho các file nhị phân. Đây là một trong những cấu hình production đa conductor được khuyến nghị, vì Redis xử lý các commit JSON bằng các transaction `MULTI` / `EXEC` native, trong khi S3 xử lý các file nhị phân.

Bạn có thể sử dụng AWS S3, hoặc một dịch vụ tương thích S3 như MinIO hoặc RustFS. Phần quan trọng là Redis vẫn là `docEngine`, vì các transaction của pixl-server-storage chỉ áp dụng cho các bản ghi JSON.

Ví dụ thiết lập:

```json
{
	"engine": "Hybrid",
	"Hybrid": {
		"docEngine": "Redis",
		"binaryEngine": "S3"
	},
	"Redis": {
		"host": "redis.internal.mycompany.com",
		"port": 6379,
		"keyPrefix": "xyops/",
		"keyTemplate": "",
		"cache": {
			"enabled": true,
			"maxItems": 100000,
			"maxBytes": 104857600
		}
	},
	"AWS": {
		"region": "us-west-1",
		"credentials": {
			"accessKeyId": "YOUR_AMAZON_ACCESS_KEY",
			"secretAccessKey": "YOUR_AMAZON_SECRET_KEY"
		}
	},
	"S3": {
		"connectTimeout": 5000,
		"socketTimeout": 5000,
		"maxAttempts": 50,
		"keyPrefix": "xyops/",
		"fileExtensions": true,
		"params": {
			"Bucket": "YOUR_S3_BUCKET_ID"
		}
	}
}
```

Sử dụng Redis và S3 khi:

- Bạn đã chạy Redis và muốn nó tiếp tục làm kho lưu trữ tài liệu của bạn.
- Bạn muốn lưu trữ file trong bộ lưu trữ object thay vì trên NFS.
- Bạn cần hỗ trợ đa conductor với các commit transaction native cho dữ liệu JSON.

Đánh đổi:

- Bạn vẫn phải vận hành hai hệ thống lưu trữ khác nhau.
- AWS S3 tốt cho các file, nhưng không tốt cho khối lượng công việc bản ghi JSON của PTOps, đó là lý do dữ liệu vẫn nằm trên Redis.
- Redis phải được cấu hình persistence, nghĩa là RDB và/hoặc AOF, nếu không một lượt restart có thể trở thành sự kiện mất mát dữ liệu.

### Postgres và NFS

Cấu hình này sử dụng [Postgres](https://github.com/jhuckaby/pixl-server-storage#postgres) cho các bản ghi JSON và [Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem) trỏ đến NFS cho các file nhị phân. Nó phù hợp nếu tổ chức của bạn đã vận hành một dịch vụ Postgres có tính sẵn sàng cao (HA) và bạn muốn giữ PTOps hoạt động bên trong mô hình vận hành đó.

Giả định:

- `postgres.internal.mycompany.com` là host Postgres của bạn.
- `/mnt/xyops` là điểm mount NFS hiển thị cho tất cả các conductor.

Ví dụ thiết lập:

```json
{
	"engine": "Hybrid",
	"Hybrid": {
		"docEngine": "Postgres",
		"binaryEngine": "Filesystem"
	},
	"Postgres": {
		"min": 1,
		"max": 32,
		"host": "postgres.internal.mycompany.com",
		"database": "YOUR_DB_INSTANCE",
		"user": "YOUR_DB_USERNAME",
		"password": "YOUR_DB_PASSWORD",
		"port": 5432,
		"statement_timeout": 5000,
		"query_timeout": 6000,
		"connectionTimeoutMillis": 30000,
		"idleTimeoutMillis": 10000,
		"table": "xyops",
		"cache": {
			"enabled": true,
			"maxItems": 100000,
			"maxBytes": 104857600
		}
	},
	"Filesystem": {
		"base_dir": "/mnt/xyops",
		"key_namespaces": 1
	}
}
```

Sử dụng cấu hình này khi:

- Đội ngũ của bạn đã vận hành Postgres ở quy mô lớn.
- Bạn muốn hỗ trợ đa conductor.
- Bạn muốn các file nằm trên bộ lưu trữ chia sẻ thay vì trong cơ sở dữ liệu.

Đánh đổi:

- Bạn vẫn phải vận hành hai hệ thống lưu trữ.
- Postgres là một kho tài liệu rất tốt ở đây, nhưng chỉ khi các file được để bên ngoài nó.

### Postgres và S3

Cấu hình này sử dụng Postgres cho các bản ghi JSON và S3 cho các file nhị phân. Đây là một trong những cấu hình production đa conductor được khuyến nghị, vì Postgres xử lý các commit JSON bằng các transaction PostgreSQL native, trong khi S3 xử lý các file nhị phân.

Bạn có thể sử dụng AWS S3, hoặc một dịch vụ tương thích S3 như MinIO hoặc RustFS. Phần quan trọng là Postgres vẫn là `docEngine`, vì các transaction của pixl-server-storage chỉ áp dụng cho các bản ghi JSON.

Ví dụ thiết lập:

```json
{
	"engine": "Hybrid",
	"Hybrid": {
		"docEngine": "Postgres",
		"binaryEngine": "S3"
	},
	"Postgres": {
		"min": 1,
		"max": 32,
		"host": "postgres.internal.mycompany.com",
		"database": "YOUR_DB_INSTANCE",
		"user": "YOUR_DB_USERNAME",
		"password": "YOUR_DB_PASSWORD",
		"port": 5432,
		"statement_timeout": 5000,
		"query_timeout": 6000,
		"connectionTimeoutMillis": 30000,
		"idleTimeoutMillis": 10000,
		"table": "xyops",
		"cache": {
			"enabled": true,
			"maxItems": 100000,
			"maxBytes": 104857600
		}
	},
	"AWS": {
		"region": "us-west-1",
		"credentials": {
			"accessKeyId": "YOUR_AMAZON_ACCESS_KEY",
			"secretAccessKey": "YOUR_AMAZON_SECRET_KEY"
		}
	},
	"S3": {
		"connectTimeout": 5000,
		"socketTimeout": 5000,
		"maxAttempts": 50,
		"keyPrefix": "xyops/",
		"fileExtensions": true,
		"params": {
			"Bucket": "YOUR_S3_BUCKET_ID"
		}
	}
}
```

Sử dụng Postgres và S3 khi:

- Bạn đã vận hành Postgres.
- Bạn đã có bộ lưu trữ object.
- Bạn muốn hỗ trợ đa conductor với các commit transaction native cho dữ liệu JSON.

Đánh đổi:

- Bạn vẫn có hai backend cần quản lý.
- AWS S3 có thể chấp nhận được đối với các file, nhưng không phù hợp cho lưu lượng database của PTOps, đó là lý do Postgres xử lý phía tài liệu.
- Postgres là một kho tài liệu rất tốt ở đây, nhưng chỉ khi các file được để bên ngoài nó.

### Postgres SSL

Engine Postgres truyền tất cả các thuộc tính bổ sung trong khối cấu hình `Postgres` trực tiếp vào [constructor pg.Pool](https://node-postgres.com/apis/pool), ngoại trừ `table` và `cache`, vốn được sử dụng bởi chính pixl-server-storage. Điều này có nghĩa là bạn có thể sử dụng các [tùy chọn node-postgres SSL tiêu chuẩn](https://node-postgres.com/features/ssl) mà không cần bất kỳ code pixl-server-storage đặc biệt nào.

Đối với một server có chứng chỉ đã được Node.js tin cậy sẵn, bạn có thể bật SSL bằng cách chỉ cần thêm `"ssl":true` như thế này:

```json
{
	"Postgres": {
		"host": "postgres.example.com",
		"database": "postgres",
		"user": "postgres",
		"password": "postgres",
		"port": 5432,
		"ssl": true
	}
}
```

Đối với một CA riêng tư, chứng chỉ server tự ký, hoặc cơ sở dữ liệu được host yêu cầu gói CA riêng của nó, hãy truyền một object `ssl`. Object này được truyền qua Node.js TLS, vì vậy bạn có thể cung cấp `ca`, `cert`, `key`, `servername`, và các tùy chọn TLS được hỗ trợ khác. Nếu bạn lưu trữ văn bản PEM trực tiếp trong JSON, hãy giữ các ký tự xuống dòng dưới dạng `\n` (mã hóa chuỗi JSON tiêu chuẩn):

```json
{
	"Postgres": {
		"host": "postgres.example.com",
		"database": "postgres",
		"user": "postgres",
		"password": "postgres",
		"port": 5432,
		"ssl": {
			"ca": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n"
		}
	}
}
```

Nếu bạn cần tải chứng chỉ CA từ đĩa, bạn cũng có thể sử dụng một `connectionString` với các tham số SSL Postgres tiêu chuẩn. Module `pg` sẽ đọc `sslrootcert` và sử dụng nó làm TLS CA:

```json
{
	"Postgres": {
		"connectionString": "postgres://postgres:postgres@postgres.example.com:5432/postgres?sslmode=verify-full&sslrootcert=/path/to/root-ca.pem",
		"max": 32,
		"table": "items"
	}
}
```

Nếu bạn đưa các tham số SSL như `sslmode`, `sslcert`, `sslkey`, hoặc `sslrootcert` vào connection string, hãy tránh thiết lập thêm một object `ssl` riêng biệt. Trình phân tích cú pháp connection string của `pg` sẽ thay thế object `ssl` khi các tham số URL đó có mặt.

Vui lòng tránh sử dụng `ssl: { "rejectUnauthorized": false }` cho môi trường production. Nó có thể hữu ích cho một bài kiểm thử chẩn đoán ngắn, nhưng nó sẽ vô hiệu hóa việc xác thực chứng chỉ.

#### AWS RDS

Amazon RDS cho PostgreSQL hoạt động tốt với thiết lập này. Tải xuống gói RDS CA thích hợp từ [tài liệu AWS RDS SSL/TLS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html), đặt nó ở nơi ứng dụng của bạn có thể đọc được, và sử dụng `sslmode=verify-full` với `sslrootcert`:

```json
{
	"Postgres": {
		"connectionString": "postgres://xyops:secret@mydb.abc123.us-east-1.rds.amazonaws.com:5432/xyops?sslmode=verify-full&sslrootcert=/opt/xyops/conf/rds-ca.pem",
		"max": 32,
		"table": "items"
	}
}
```

AWS có một vài điểm đặc thù cần lưu ý:

* RDS cho PostgreSQL 15 và mới hơn bật `rds.force_ssl` theo mặc định, vì vậy các kết nối không có SSL có thể bị từ chối với lỗi tương tự như `no pg_hba.conf entry ... SSL off`.
* `sslmode=verify-full` xác thực cả chuỗi chứng chỉ và hostname. Hãy sử dụng hostname endpoint RDS thực tế trong connection string của bạn khi có thể.
* Nếu bạn kết nối thông qua một tên DNS tùy chỉnh, SSH tunnel, hoặc proxy nội bộ, việc xác thực hostname có thể cần endpoint RDS ban đầu làm tùy chọn TLS `servername`. Trong trường hợp đó, hãy ưu tiên các thuộc tính cấu hình rõ ràng và một object `ssl` thay vì các tham số SSL của URL.
* AWS khuyên bạn nên tin tưởng chứng chỉ RDS CA gốc. Tránh ghim (pinning) các chứng chỉ trung gian, vì điều đó có thể gây rắc rối khi RDS xoay vòng các chứng chỉ server.

## Các cấu hình dành cho nhà phát triển

> [!WARNING]
> Các cấu hình sau đây về mặt kỹ thuật vẫn hoạt động, vì pixl-server-storage cho phép các bản ghi JSON và các file nhị phân nằm trong cùng một engine. Tuy nhiên, chúng không được khuyến nghị cho việc sử dụng production nghiêm túc với PTOps. Chúng phù hợp hơn cho việc phát triển, thử nghiệm và các trường hợp biên nơi bạn hiểu rõ các đánh đổi.

### SQLite

Sử dụng plain [SQLite](https://github.com/jhuckaby/pixl-server-storage#sqlite) làm engine lưu trữ duy nhất có nghĩa là **cả** các bản ghi JSON và các file nhị phân đều được lưu trữ bên trong cùng một file cơ sở dữ liệu. Điều này thuận tiện cho việc phát triển vì mọi thứ nằm ở một nơi, nhưng nó không phù hợp cho môi trường production.

Tại sao nó không được khuyến nghị:

- Các file lớn trở thành các `BLOB` bên trong bảng, vì vậy việc tải lên và tải xuống phải được hiện thực hóa thông qua SQLite và bộ nhớ tiến trình.
- Các blob lớn làm phình file WAL, các bản backup, restore và các hoạt động vacuum.
- Cơ sở dữ liệu vẫn nằm trên một máy host, vì vậy điều này không giải quyết được việc chia sẻ lưu trữ đa conductor.
- Một cơ sở dữ liệu đáng lẽ chỉ chứa các bản ghi JSON nhỏ giờ đây phải mang thêm cả lưu trữ file thông thường, đây là sự kết hợp khối lượng công việc không đúng.

Chỉ sử dụng SQLite đơn độc cho việc phát triển cục bộ, các thiết lập lab nhỏ hoặc thử nghiệm tạm thời.

### S3

Sử dụng dịch vụ [S3](https://github.com/jhuckaby/pixl-server-storage#amazon-s3) được host trên đám mây làm engine lưu trữ duy nhất có nghĩa là mọi bản ghi JSON, trang danh sách, trang hash, bản ghi transaction và object liên quan đến index đều được lưu trữ dưới dạng một object S3 riêng biệt. pixl-server-storage hỗ trợ điều này, nhưng PTOps là một khối lượng công việc tồi tệ đối với lưu trữ object độ trễ cao ở phía tài liệu.

Để làm rõ, điều này đặc biệt nói về các dịch vụ S3 được host trên đám mây như AWS S3, Cloudflare R2, Backblaze B2, Wasabi, DigitalOcean Spaces, Vultr, Akamai Object Storage, v.v.

Tại sao nó không được khuyến nghị:

- PTOps thực hiện một số lượng cực kỳ lớn các hoạt động đọc và ghi đối với các object JSON nhỏ.
- Ngay cả khi bật bộ nhớ đệm (cache) S3, các lượt cache miss và các quy trình transaction vẫn phải chịu độ trễ của kho lưu trữ object từ xa.
- Các danh sách, hash, index và các tác vụ bảo trì làm trầm trọng thêm vấn đề object nhỏ.
- S3 được thiết kế cho việc lưu trữ object bền vững, chứ không phải làm cơ sở dữ liệu độ trễ thấp cho hàng triệu bản ghi nhỏ.

S3 là một `binaryEngine` xuất sắc (như một phần của việc chia tách [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid)). Nó không phải là engine tất-cả-trong-một được khuyến nghị cho production PTOps, ngay cả khi dịch vụ S3 là một dịch vụ nhanh và chạy on premises như [MinIO](#minio) hoặc [RustFS](#rustfs), vì engine S3 không hỗ trợ các transaction native. Hãy sử dụng Redis hoặc Postgres cho `docEngine` của Hybrid thay thế.

### Redis

Sử dụng [Redis](https://github.com/jhuckaby/pixl-server-storage#redis) làm engine lưu trữ duy nhất có nghĩa là cả bản ghi JSON và payload file thông thường đều nằm trong bộ nhớ Redis. Điều đó rất nhanh, nhưng nó cũng rất đắt đỏ và không tiện lợi về mặt vận hành đối với việc lưu trữ nhị phân.

Tại sao nó không được khuyến nghị:

- Các file tiêu thụ RAM trong quá trình truyền tải.
- Các hoạt động persistence như chụp snapshot RDB và viết lại AOF trở nên lớn hơn và chậm hơn.
- Việc nhân bản (replication) và restart trở nên khó khăn hơn khi các payload nhị phân tích tụ lại.
- Nếu cơ chế eviction của Redis được bật và xảy ra áp lực bộ nhớ, nguy cơ mất file là hoàn toàn có thật.

Redis là một kho tài liệu tuyệt vời cho PTOps, với điều kiện là tính năng persistence được bật. Nó không phải là một nơi tốt để giữ các file upload, file đính kèm và file blob thông thường.

### Postgres

Sử dụng plain [Postgres](https://github.com/jhuckaby/pixl-server-storage#postgres) làm engine lưu trữ duy nhất có nghĩa là cả bản ghi JSON và các file thông thường đều được lưu trữ trong cùng một bảng dưới dạng payload `BYTEA`. Điều này có hoạt động, nhưng nó không phải là thứ Postgres làm tốt nhất.

Tại sao nó không được khuyến nghị:

- Các payload nhị phân lớn làm phình bảng, luồng WAL, các bản backup và lưu lượng nhân bản.
- Việc upload và download file vẫn phải chảy qua pool kết nối cơ sở dữ liệu và tiêu thụ bộ nhớ.
- Hoạt động autovacuum và bảo trì bảng nói chung trở nên nặng nề hơn mức cần thiết.
- Nó trộn lẫn hai khối lượng công việc không liên quan, lưu trữ tài liệu giao dịch và lưu trữ file thông thường, vào cùng một nơi.

Postgres là một `docEngine` rất tốt (như một phần của việc chia tách [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid)). Nó không phải là một engine tất-cả-trong-một tuyệt vời cho PTOps.

### NFS

Sử dụng plain [Filesystem](https://github.com/jhuckaby/pixl-server-storage#local-filesystem) trỏ đến NFS làm engine lưu trữ duy nhất nghe có vẻ đơn giản, nhưng điều đó có nghĩa là PTOps lưu trữ **mọi thứ** dưới dạng file trên một hệ thống file dùng chung, bao gồm cả khối lượng công việc tài liệu của nó. Đó chính xác là mô hình không phù hợp cho NFS ở quy mô lớn.

Tại sao nó không được khuyến nghị:

- PTOps tạo ra một số lượng rất lớn các bản ghi JSON nhỏ, điều này đồng nghĩa với việc biến động siêu dữ liệu (metadata) liên tục và các hoạt động I/O file nhỏ.
- Các hệ thống file qua mạng nói chung rất ghét hàng triệu file nhỏ trải rộng trên một tập hợp công việc nóng (hot working set).
- Tính nhất quán của cache (cache coherency), hành vi khóa (locking) và độ trễ đều tệ hơn đĩa cục bộ hoặc một kho chứa key/value thực tế.
- Bạn có thể cải thiện tính nhất quán bằng các tùy chọn mount như `noac` và `sync`, nhưng điều đó thường làm cho hiệu suất thậm chí còn tệ hơn.

NFS có thể chấp nhận được như một `binaryEngine` chỉ dành cho các file (như một phần của việc chia tách [Hybrid](https://github.com/jhuckaby/pixl-server-storage#hybrid)). Nó không nên là backend vạn năng cho dữ liệu production PTOps của bạn.

## Di chuyển dữ liệu (Migration)

Việc di chuyển giữa các cấu hình lưu trữ rất đơn giản, nhưng hãy thực hiện việc đó trong một khoảng thời gian bảo trì (maintenance window). Cách tiếp cận an toàn nhất là:

1. Trong UI PTOps, vào mục **System** và nhấp vào **Export Data**.
2. Export mọi thứ bạn cần từ hệ thống cũ. Để di chuyển logic đầy đủ, hãy chọn tất cả các danh sách, tất cả các index và tất cả các mục bổ sung, bao gồm các file bucket, file ticket, file job, avatar của user, dữ liệu monitor và bất kỳ payload nào khác bạn quan tâm.
3. Tắt hoàn toàn PTOps.
4. Thay đổi cấu hình [Storage](config.md#storage) sang engine mới hoặc thiết lập hybrid mới.
5. Khởi động lại PTOps. Nếu bộ lưu trữ mới trống, PTOps sẽ tạo một tập dữ liệu mặc định mới và bạn có thể đăng nhập bằng `admin` / `admin`.
6. Quay lại mục **System** và import archive đã export vào backend lưu trữ mới.
7. Xác minh các user, lịch trình (schedule), alert, bucket, ticket và các file đã tải lên trước khi đưa hệ thống trở lại hoạt động.

Lưu ý quan trọng:

- Quy trình export/import là một **sự di chuyển logic (logical migration)**, chứ không phải là một bản sao byte-đối-byte của backend cũ của bạn.
- Nếu bạn muốn di chuyển thực sự hoàn chỉnh, hãy đảm bảo rằng bạn đã bao gồm các mục bổ sung có liên quan cho các payload nhị phân.
- Các file job và log job rất lớn có thể không được đưa vào bản export nếu chúng vượt quá giới hạn export tích hợp sẵn.
- Luôn giữ một bản backup của backend cũ cho đến khi bạn đã xác thực hoàn toàn backend mới.

Để biết thêm chi tiết về định dạng export, xem [Định dạng backup PTOps](xybk.md).
