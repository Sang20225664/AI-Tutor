# Hệ thức lượng trong tam giác vuông

## 1. Các khái niệm cơ bản

### 1.1. Tam giác vuông

Tam giác vuông là tam giác có một góc vuông (bằng 90°).

Cho tam giác ABC vuông tại A:
- **BC** là cạnh huyền (cạnh đối diện góc vuông, cạnh lớn nhất)
- **AB** và **AC** là hai cạnh góc vuông
- **∠B** và **∠C** là hai góc nhọn (có tổng bằng 90°)

### 1.2. Hình chiếu

Cho tam giác ABC vuông tại A, đường cao AH:
- **BH** là hình chiếu của AB trên BC
- **CH** là hình chiếu của AC trên BC
- **AH** là đường cao ứng với cạnh huyền BC

## 2. Định lý Pythagore

Trong tam giác vuông, **bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông**.

**Công thức:**

BC² = AB² + AC²

**Ví dụ 1:**

Cho tam giác ABC vuông tại A có AB = 3 cm, AC = 4 cm. Tính BC.

**Giải:**

Áp dụng định lý Pythagore:
```
BC² = AB² + AC²
BC² = 3² + 4²
BC² = 9 + 16 = 25
BC = 5 cm
```

### Định lý đảo

Nếu một tam giác có bình phương một cạnh bằng tổng bình phương hai cạnh kia thì tam giác đó là tam giác vuông.

**Ví dụ 2:**

Cho tam giác ABC có AB = 5 cm, AC = 12 cm, BC = 13 cm. Chứng minh tam giác ABC vuông.

**Giải:**

Ta có: AB² + AC² = 5² + 12² = 25 + 144 = 169

BC² = 13² = 169

Vì AB² + AC² = BC², nên tam giác ABC vuông tại A.

## 3. Hệ thức về cạnh và đường cao

Cho tam giác ABC vuông tại A, đường cao AH (H ∈ BC).

### 3.1. Hệ thức 1: Bình phương đường cao

**AH² = BH · CH**

Bình phương đường cao ứng với cạnh huyền bằng tích hai hình chiếu của hai cạnh góc vuông trên cạnh huyền.

### 3.2. Hệ thức 2: Bình phương cạnh góc vuông

**AB² = BH · BC**

**AC² = CH · BC**

Bình phương mỗi cạnh góc vuông bằng tích hình chiếu của cạnh đó trên cạnh huyền với cạnh huyền.

### 3.3. Hệ thức 3: Tích hai cạnh góc vuông

**AB · AC = AH · BC**

Tích hai cạnh góc vuông bằng tích đường cao ứng với cạnh huyền và cạnh huyền.

### 3.4. Hệ thức 4: Nghịch đảo bình phương đường cao

**1/AH² = 1/AB² + 1/AC²**

Nghịch đảo bình phương đường cao bằng tổng nghịch đảo bình phương hai cạnh góc vuông.

## 4. Ví dụ áp dụng hệ thức

### Ví dụ 3: Tính đường cao

Cho tam giác ABC vuông tại A có AB = 6 cm, AC = 8 cm. Kẻ đường cao AH. Tính AH, BH, CH.

**Giải:**

**Bước 1:** Tính BC

BC² = AB² + AC² = 6² + 8² = 36 + 64 = 100

BC = 10 cm

**Bước 2:** Tính AH

Cách 1: Dùng hệ thức AB · AC = AH · BC
```
6 · 8 = AH · 10
AH = 48/10 = 4,8 cm
```

Cách 2: Dùng hệ thức 1/AH² = 1/AB² + 1/AC²
```
1/AH² = 1/36 + 1/64 = 64/2304 + 36/2304 = 100/2304
AH² = 2304/100 = 23,04
AH = 4,8 cm
```

**Bước 3:** Tính BH và CH

Từ AB² = BH · BC:
```
36 = BH · 10
BH = 3,6 cm
```

CH = BC - BH = 10 - 3,6 = 6,4 cm

(Hoặc: AC² = CH · BC ⟹ 64 = CH · 10 ⟹ CH = 6,4 cm)

### Ví dụ 4: Tính các cạnh

Cho tam giác ABC vuông tại A, đường cao AH. Biết BH = 4 cm, CH = 9 cm. Tính AB, AC, AH.

**Giải:**

**Tính BC:**
BC = BH + CH = 4 + 9 = 13 cm

**Tính AH:**
AH² = BH · CH = 4 · 9 = 36

AH = 6 cm

**Tính AB:**
AB² = BH · BC = 4 · 13 = 52

AB = √52 = 2√13 cm

**Tính AC:**
AC² = CH · BC = 9 · 13 = 117

AC = √117 = 3√13 cm

## 5. Tỷ số lượng giác

### 5.1. Định nghĩa

Cho tam giác ABC vuông tại A, xét góc nhọn B:

- **sin B = AC/BC** (cạnh đối / cạnh huyền)
- **cos B = AB/BC** (cạnh kề / cạnh huyền)
- **tan B = AC/AB** (cạnh đối / cạnh kề)
- **cot B = AB/AC** (cạnh kề / cạnh đối)

### 5.2. Các hệ thức cơ bản

1. **sin²α + cos²α = 1**

2. **tan α = sin α / cos α**

3. **cot α = cos α / sin α**

4. **tan α · cot α = 1**

5. **1 + tan²α = 1/cos²α**

6. **1 + cot²α = 1/sin²α**

### 5.3. Tỷ số của hai góc phụ nhau

Nếu α + β = 90° thì:
- sin α = cos β
- cos α = sin β
- tan α = cot β
- cot α = tan β

### Ví dụ 5: Tính tỷ số lượng giác

Cho tam giác ABC vuông tại A có AB = 3 cm, AC = 4 cm. Tính sin B, cos B, tan B.

**Giải:**

BC² = AB² + AC² = 9 + 16 = 25 ⟹ BC = 5 cm

sin B = AC/BC = 4/5 = 0,8

cos B = AB/BC = 3/5 = 0,6

tan B = AC/AB = 4/3 ≈ 1,33

### Ví dụ 6: Tìm cạnh từ tỷ số

Cho tam giác ABC vuông tại A có BC = 10 cm và sin B = 0,6. Tính AC và AB.

**Giải:**

sin B = AC/BC ⟹ AC = BC · sin B = 10 · 0,6 = 6 cm

AB² = BC² - AC² = 100 - 36 = 64

AB = 8 cm

## 6. Bài toán thực tế

### Bài toán 1: Chiều cao của cây

Một người đứng cách cây 20m, nhìn lên đỉnh cây với góc nâng 30°. Biết chiều cao từ mắt đến đất là 1,6m. Tính chiều cao của cây.

**Giải:**

Gọi h (m) là khoảng cách từ mắt đến đỉnh cây.

tan 30° = h/20 ⟹ h = 20 · tan 30° = 20 · (√3/3) ≈ 11,55m

Chiều cao cây = 11,55 + 1,6 = 13,15m

### Bài toán 2: Độ dốc của mái nhà

Một mái nhà có chiều dài 5m, độ cao từ nóc đến chân mái là 2m. Tính góc nghiêng của mái nhà.

**Giải:**

sin α = 2/5 = 0,4

α ≈ 23,6°

## 7. Bài tập tự luyện

1. Cho tam giác ABC vuông tại A có AB = 5 cm, BC = 13 cm. Tính AC.

2. Cho tam giác ABC vuông tại A, đường cao AH. Biết BH = 3 cm, CH = 12 cm. Tính AB, AC, AH.

3. Cho tam giác ABC vuông tại A có AB = 6 cm, AC = 8 cm. Tính sin B, cos B, tan C.

4. Cho tam giác ABC vuông tại A có BC = 15 cm, sin B = 0,8. Tính AB và AC.

5. Một cái thang dài 5m dựa vào tường. Chân thang cách tường 3m. Hỏi:
   - a) Đầu thang cách mặt đất bao nhiêu?
   - b) Thang tạo với mặt đất góc bao nhiêu độ?

6. Chứng minh rằng trong tam giác ABC vuông tại A, đường cao AH:
   - a) AH² = BH · CH
   - b) AB · AC = BC · AH
