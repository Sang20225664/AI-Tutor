# Hệ phương trình bậc nhất hai ẩn

## 1. Khái niệm

### 1.1. Phương trình bậc nhất hai ẩn

Phương trình bậc nhất hai ẩn x, y là phương trình có dạng:

**ax + by = c**

Trong đó: a, b, c là các số thực cho trước, a và b không đồng thời bằng 0.

**Ví dụ:**
- 2x + 3y = 6
- x - y = 1
- 3x + 0y = 9 (hay 3x = 9)

### 1.2. Nghiệm của phương trình

Cặp số (x₀; y₀) được gọi là một nghiệm của phương trình ax + by = c nếu thay x = x₀, y = y₀ vào phương trình ta được một đẳng thức đúng.

**Ví dụ:** Xét phương trình 2x + y = 5
- (1; 3) là nghiệm vì 2·1 + 3 = 5 ✓
- (2; 1) là nghiệm vì 2·2 + 1 = 5 ✓
- (0; 5) là nghiệm vì 2·0 + 5 = 5 ✓

Phương trình bậc nhất hai ẩn có **vô số nghiệm**.

### 1.3. Hệ phương trình bậc nhất hai ẩn

Hệ phương trình bậc nhất hai ẩn có dạng:

```
{ ax + by = c    (1)
{ a'x + b'y = c' (2)
```

Trong đó: a, b, c, a', b', c' là các số thực cho trước.

Cặp số (x₀; y₀) là nghiệm của hệ nếu nó đồng thời là nghiệm của cả hai phương trình (1) và (2).

## 2. Phương pháp giải hệ phương trình

### 2.1. Phương pháp thế

**Nguyên tắc:**
- Từ một phương trình của hệ, biểu diễn một ẩn theo ẩn kia
- Thế biểu thức vừa tìm được vào phương trình còn lại để có phương trình một ẩn
- Giải phương trình một ẩn rồi suy ra nghiệm của hệ

**Ví dụ 1:** Giải hệ phương trình
```
{ x + y = 5     (1)
{ 2x - y = 1    (2)
```

**Giải:**

Từ (1): y = 5 - x

Thế vào (2): 2x - (5 - x) = 1
```
2x - 5 + x = 1
3x = 6
x = 2
```

Thế x = 2 vào (1): 2 + y = 5 ⟹ y = 3

Vậy hệ có nghiệm duy nhất: (x; y) = (2; 3)

### 2.2. Phương pháp cộng đại số

**Nguyên tắc:**
- Nhân hai vế của mỗi phương trình với một số thích hợp (nếu cần) để hệ số của một ẩn nào đó trong hai phương trình bằng nhau hoặc đối nhau
- Cộng hoặc trừ từng vế hai phương trình để được phương trình mới chỉ còn một ẩn
- Giải phương trình một ẩn rồi suy ra nghiệm của hệ

**Ví dụ 2:** Giải hệ phương trình
```
{ 2x + 3y = 8   (1)
{ x - y = 1     (2)
```

**Giải:**

Nhân (2) với 3: 3x - 3y = 3  (3)

Cộng (1) và (3):
```
2x + 3y = 8
3x - 3y = 3
-----------
5x = 11
x = 11/5
```

Thế x = 11/5 vào (2):
```
11/5 - y = 1
y = 11/5 - 1
y = 6/5
```

Vậy hệ có nghiệm: (x; y) = (11/5; 6/5)

**Ví dụ 3:** Phương pháp cộng (trừ trực tiếp)

Giải hệ phương trình
```
{ 3x + 2y = 11  (1)
{ 3x - y = 5    (2)
```

**Giải:**

Trừ (1) cho (2):
```
(3x + 2y) - (3x - y) = 11 - 5
3y = 6
y = 2
```

Thế y = 2 vào (2):
```
3x - 2 = 5
3x = 7
x = 7/3
```

Vậy nghiệm: (x; y) = (7/3; 2)

## 3. Các trường hợp đặc biệt

### 3.1. Hệ có vô số nghiệm

Xét hệ:
```
{ 2x + y = 3
{ 4x + 2y = 6
```

Phương trình (2) là phương trình (1) nhân với 2, nên hai phương trình biểu diễn cùng một đường thẳng.

Hệ có **vô số nghiệm**.

**Điều kiện:** a/a' = b/b' = c/c'

### 3.2. Hệ vô nghiệm

Xét hệ:
```
{ 2x + y = 3
{ 4x + 2y = 10
```

Nếu nhân (1) với 2: 4x + 2y = 6 ≠ 10

Hai đường thẳng song song, không có điểm chung.

Hệ **vô nghiệm**.

**Điều kiện:** a/a' = b/b' ≠ c/c'

### 3.3. Hệ có nghiệm duy nhất

Điều kiện: a/a' ≠ b/b'

Đây là trường hợp phổ biến nhất.

## 4. Ví dụ tổng hợp

### Ví dụ 4: Hệ có phân số

Giải hệ:
```
{ (1/2)x + (1/3)y = 1
{ (2/3)x - (1/4)y = 1/2
```

**Giải:**

Quy đồng mẫu số, nhân (1) với 6: 3x + 2y = 6  (3)

Nhân (2) với 12: 8x - 3y = 6  (4)

Từ (3): y = (6 - 3x)/2

Thế vào (4):
```
8x - 3·(6 - 3x)/2 = 6
16x - 3(6 - 3x) = 12
16x - 18 + 9x = 12
25x = 30
x = 6/5
```

Thế vào (3): 3·(6/5) + 2y = 6 ⟹ y = 6/5

Nghiệm: (x; y) = (6/5; 6/5)

### Ví dụ 5: Hệ có dấu ngoặc

Giải hệ:
```
{ 2(x + y) - (x - y) = 5
{ 3(x - y) + 2(x + y) = 3
```

**Giải:**

Phá ngoặc:
```
2x + 2y - x + y = 5  ⟹  x + 3y = 5   (1)
3x - 3y + 2x + 2y = 3 ⟹  5x - y = 3  (2)
```

Từ (2): y = 5x - 3

Thế vào (1):
```
x + 3(5x - 3) = 5
x + 15x - 9 = 5
16x = 14
x = 7/8
```

y = 5·(7/8) - 3 = 11/8

Nghiệm: (x; y) = (7/8; 11/8)

## 5. Bài toán thực tế

### Bài toán 1: Tìm số

Tìm hai số, biết tổng của chúng bằng 50 và hiệu của chúng bằng 10.

**Giải:**

Gọi x, y là hai số cần tìm (x > y)

Theo đề bài:
```
{ x + y = 50
{ x - y = 10
```

Cộng hai phương trình: 2x = 60 ⟹ x = 30

Thế vào (1): 30 + y = 50 ⟹ y = 20

Vậy hai số cần tìm là 30 và 20.

### Bài toán 2: Toán chuyển động

Hai ô tô cùng xuất phát từ A đến B cách nhau 300 km. Xe thứ nhất khởi hành trước xe thứ hai 1 giờ. Biết vận tốc xe thứ nhất là 50 km/h, xe thứ hai là 60 km/h. Hỏi sau bao lâu kể từ khi xe thứ hai xuất phát thì hai xe gặp nhau?

**Giải:**

Gọi t (giờ) là thời gian xe thứ hai đi được khi hai xe gặp nhau (t > 0)

Thời gian xe thứ nhất đi: t + 1 (giờ)

Quãng đường xe 1 đi: 50(t + 1) km

Quãng đường xe 2 đi: 60t km

Khi gặp nhau: 50(t + 1) + 60t = 300
```
50t + 50 + 60t = 300
110t = 250
t = 25/11 ≈ 2,27 giờ
```

Vậy sau khoảng 2 giờ 16 phút kể từ khi xe thứ hai xuất phát, hai xe sẽ gặp nhau.

### Bài toán 3: Toán về tỷ lệ phần trăm

Một cửa hàng bán hai loại hàng A và B. Giá bán loại A là 30.000 đồng/kg, loại B là 40.000 đồng/kg. Một ngày bán được 100 kg và thu về 3.400.000 đồng. Hỏi mỗi loại bán được bao nhiêu kg?

**Giải:**

Gọi x (kg) là khối lượng hàng A bán được (x ≥ 0)

Gọi y (kg) là khối lượng hàng B bán được (y ≥ 0)

Theo đề bài:
```
{ x + y = 100           (tổng khối lượng)
{ 30000x + 40000y = 3400000  (tổng tiền)
```

Rút gọn phương trình (2): 3x + 4y = 340

Hệ trở thành:
```
{ x + y = 100
{ 3x + 4y = 340
```

Từ (1): x = 100 - y

Thế vào (2):
```
3(100 - y) + 4y = 340
300 - 3y + 4y = 340
y = 40
```

x = 100 - 40 = 60

Vậy bán được 60 kg hàng A và 40 kg hàng B.

## 6. Lưu ý khi giải

1. **Lựa chọn phương pháp phù hợp:**
   - Phương pháp thế: khi có phương trình đơn giản dễ biểu diễn ẩn
   - Phương pháp cộng: khi hệ số của cùng một ẩn bằng nhau hoặc đối nhau

2. **Kiểm tra nghiệm** bằng cách thế vào hệ ban đầu

3. **Đặt ẩn rõ ràng** trong bài toán có lời văn

4. **Chú ý điều kiện** của ẩn (không âm, nguyên dương, etc.)

## 7. Bài tập tự luyện

1. Giải các hệ phương trình bằng phương pháp thế:
   - a) { x + 2y = 7; 3x - y = 5 }
   - b) { 2x - y = 3; x + 3y = 10 }

2. Giải các hệ bằng phương pháp cộng:
   - a) { 3x + 2y = 13; 2x - 2y = 2 }
   - b) { 5x - 3y = 7; 2x + y = 8 }

3. Xét xem các hệ sau có bao nhiêu nghiệm:
   - a) { 2x + y = 5; 4x + 2y = 10 }
   - b) { x - y = 3; 2x - 2y = 5 }

4. Bài toán: Một số có hai chữ số. Tổng hai chữ số là 11. Nếu đổi chỗ hai chữ số thì được số mới lớn hơn số cũ 27 đơn vị. Tìm số ban đầu.

5. Một người mua 5 bút và 3 vở hết 67.000 đồng. Một người khác mua 3 bút và 4 vở hết 53.000 đồng. Tính giá tiền một bút và một vở.
