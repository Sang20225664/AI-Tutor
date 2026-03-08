# Hàm số bậc nhất

## 1. Khái niệm hàm số bậc nhất

Hàm số bậc nhất là hàm số có dạng **y = ax + b**, trong đó:
- **a** và **b** là các số thực cho trước
- **a ≠ 0** (điều kiện bắt buộc)
- **x** là biến số
- **y** là giá trị của hàm số

Hàm số bậc nhất còn được gọi là hàm affine trong toán học. Đây là một trong những dạng hàm số đơn giản nhất nhưng có ứng dụng rất rộng rãi trong thực tế.

## 2. Tập xác định

Tập xác định của hàm số bậc nhất y = ax + b là **D = ℝ** (tập hợp tất cả các số thực).

Điều này có nghĩa là với mọi giá trị thực của x, ta đều tính được giá trị tương ứng của y. Không có giá trị x nào làm cho hàm số không xác định.

## 3. Tính chất

### 3.1. Tính đồng biến và nghịch biến

- Nếu **a > 0**: hàm số đồng biến trên ℝ
  - Khi x tăng thì y cũng tăng
  - Đồ thị có hướng từ dưới lên trên (từ trái sang phải)

- Nếu **a < 0**: hàm số nghịch biến trên ℝ
  - Khi x tăng thì y giảm
  - Đồ thị có hướng từ trên xuống dưới (từ trái sang phải)

### 3.2. Chiều biến thiên

Xét hai giá trị x₁, x₂ bất kỳ với x₁ < x₂:

- Nếu a > 0 thì f(x₁) < f(x₂)
- Nếu a < 0 thì f(x₁) > f(x₂)

## 4. Đồ thị hàm số bậc nhất

Đồ thị của hàm số y = ax + b là một **đường thẳng** trong mặt phẳng tọa độ Oxy.

### Các đặc điểm của đồ thị:

1. **Hệ số góc**: a là hệ số góc (độ dốc) của đường thẳng
   - |a| càng lớn thì đường thẳng càng dốc
   - |a| càng nhỏ thì đường thẳng càng thoai thoải

2. **Tung độ gốc**: b là tung độ của điểm giao với trục Oy
   - Đồ thị cắt trục Oy tại điểm (0, b)

3. **Hoành độ gốc**: Đồ thị cắt trục Ox tại điểm (-b/a, 0)

### Cách vẽ đồ thị:

**Bước 1**: Tìm hai điểm thuộc đồ thị
- Cho x = 0 → y = b → điểm A(0, b)
- Cho y = 0 → x = -b/a → điểm B(-b/a, 0)

**Bước 2**: Vẽ đường thẳng đi qua hai điểm A và B

## 5. Ví dụ minh họa

### Ví dụ 1: Xét tính đồng biến, nghịch biến

Cho hàm số y = 2x - 3

**Giải:**
- Hệ số a = 2 > 0
- Vậy hàm số đồng biến trên ℝ
- Khi x tăng thì y tăng

### Ví dụ 2: Vẽ đồ thị hàm số

Vẽ đồ thị hàm số y = -x + 2

**Giải:**

Bước 1: Tìm hai điểm thuộc đồ thị
- Cho x = 0: y = -0 + 2 = 2 → A(0, 2)
- Cho x = 2: y = -2 + 2 = 0 → B(2, 0)

Bước 2: Vẽ đường thẳng đi qua A(0, 2) và B(2, 0)

Nhận xét: Vì a = -1 < 0 nên đồ thị có hướng đi xuống từ trái sang phải.

### Ví dụ 3: Xác định hàm số

Xác định hàm số bậc nhất y = ax + b, biết đồ thị đi qua hai điểm M(1, 3) và N(2, 5).

**Giải:**

Vì đồ thị đi qua M(1, 3) nên: 3 = a·1 + b → a + b = 3 (1)

Vì đồ thị đi qua N(2, 5) nên: 5 = a·2 + b → 2a + b = 5 (2)

Từ (1) và (2):
- Lấy (2) - (1): a = 2
- Thay vào (1): 2 + b = 3 → b = 1

Vậy hàm số cần tìm là: **y = 2x + 1**

## 6. Ứng dụng thực tế

Hàm số bậc nhất có nhiều ứng dụng trong đời sống:

1. **Kinh tế**: Tính toán chi phí sản xuất (chi phí cố định + chi phí biến đổi)
   - C = F + vx (F: chi phí cố định, v: chi phí biến đổi trên đơn vị, x: số lượng)

2. **Vật lý**: Chuyển động thẳng đều
   - s = vt + s₀ (s: quãng đường, v: vận tốc, t: thời gian, s₀: vị trí ban đầu)

3. **Nhiệt học**: Chuyển đổi nhiệt độ
   - F = 1.8C + 32 (chuyển từ độ C sang độ F)

4. **Điện học**: Định luật Ohm
   - U = RI (U: hiệu điện thế, R: điện trở, I: cường độ dòng điện)

## 7. Bài tập tự luyện

1. Xét tính đồng biến, nghịch biến của các hàm số:
   - a) y = 3x + 1
   - b) y = -2x + 5

2. Vẽ đồ thị các hàm số sau:
   - a) y = x + 1
   - b) y = -x + 3

3. Xác định hàm số y = ax + b, biết đồ thị đi qua:
   - a) A(0, 2) và B(1, 4)
   - b) M(-1, 1) và N(2, 7)

4. Một xe taxi tính phí theo công thức: C = 10000 + 15000d (đồng), trong đó d là số km đi được. Hỏi:
   - a) Đi 5km phải trả bao nhiêu tiền?
   - b) Nếu trả 100.000 đồng thì đi được bao nhiêu km?
