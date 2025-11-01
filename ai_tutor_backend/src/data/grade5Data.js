// Data chi tiết cho lớp 5 - Chương trình tiểu học Việt Nam

// === QUIZZES CHO LỚP 5 ===
const grade5Quizzes = [
    // TOÁN HỌC LỚP 5
    {
        title: 'Phân số - Lớp 5',
        description: 'Kiểm tra kiến thức về phân số: tối giản, so sánh, cộng trừ phân số',
        subjectName: 'Toán học',
        grade: [5],
        difficulty: 'medium',
        questions: [
            { question: 'Rút gọn phân số 12/18 về phân số tối giản', options: ['1/2', '2/3', '3/4', '4/6'], answer: 1 },
            { question: '2/3 + 1/6 = ?', options: ['3/9', '5/6', '1/2', '3/6'], answer: 1 },
            { question: 'So sánh: 3/4 ... 5/6', options: ['>', '<', '=', 'Không so sánh được'], answer: 1 },
            { question: '5/6 - 1/3 = ?', options: ['1/2', '4/6', '1/3', '2/3'], answer: 0 },
            { question: 'Quy đồng mẫu số: 1/2 và 1/3', options: ['3/6 và 2/6', '2/4 và 3/6', '1/3 và 1/2', '3/5 và 2/5'], answer: 0 },
        ],
    },
    {
        title: 'Số thập phân - Lớp 5',
        description: 'Bài tập về số thập phân: đọc, viết, so sánh, tính toán',
        subjectName: 'Toán học',
        grade: [5],
        difficulty: 'medium',
        questions: [
            { question: '2,5 + 3,75 = ?', options: ['5,25', '6,25', '6,00', '5,75'], answer: 1 },
            { question: '10 - 3,4 = ?', options: ['7,6', '6,6', '7,4', '6,4'], answer: 1 },
            { question: 'So sánh: 4,5 ... 4,50', options: ['>', '<', '=', 'Không so sánh được'], answer: 2 },
            { question: '2,5 × 4 = ?', options: ['8', '10', '12', '8,5'], answer: 1 },
            { question: '15,6 : 2 = ?', options: ['7,8', '7,3', '8,3', '6,8'], answer: 0 },
        ],
    },
    {
        title: 'Hình học - Lớp 5',
        description: 'Chu vi, diện tích hình vuông, hình chữ nhật, hình tam giác',
        subjectName: 'Toán học',
        grade: [5],
        difficulty: 'medium',
        questions: [
            { question: 'Diện tích hình vuông cạnh 5cm là:', options: ['20cm²', '25cm²', '30cm²', '10cm²'], answer: 1 },
            { question: 'Chu vi hình chữ nhật dài 8cm, rộng 5cm là:', options: ['26cm', '40cm', '13cm', '52cm'], answer: 0 },
            { question: 'Diện tích hình tam giác có đáy 6cm, chiều cao 4cm là:', options: ['24cm²', '10cm²', '12cm²', '20cm²'], answer: 2 },
            { question: 'Hình vuông có chu vi 20cm thì cạnh dài:', options: ['4cm', '5cm', '10cm', '8cm'], answer: 1 },
            { question: 'Diện tích hình chữ nhật dài 12cm, rộng 8cm là:', options: ['40cm²', '96cm²', '20cm²', '48cm²'], answer: 1 },
        ],
    },

    // TIẾNG VIỆT LỚP 5
    {
        title: 'Ngữ văn lớp 5 - Đọc hiểu',
        description: 'Kiểm tra khả năng đọc hiểu văn bản, tìm ý chính',
        subjectName: 'Ngữ văn',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Thành ngữ "Có công mài sắt có ngày nên kim" có nghĩa là gì?', options: ['Chăm chỉ thì thành công', 'Biết làm việc nhà', 'Giỏi mài dao', 'Khéo tay'], answer: 0 },
            { question: 'Từ nào là danh từ?', options: ['Chạy', 'Đẹp', 'Sách', 'Nhanh'], answer: 2 },
            { question: 'Câu "Hôm nay trời đẹp quá!" là câu gì?', options: ['Câu kể', 'Câu hỏi', 'Câu cảm', 'Câu khiến'], answer: 2 },
            { question: 'Từ trái nghĩa với "cao" là:', options: ['Thấp', 'To', 'Nhỏ', 'Lớn'], answer: 0 },
            { question: 'Dấu câu nào dùng để kết thúc câu hỏi?', options: ['!', '.', '?', ','], answer: 2 },
        ],
    },
    {
        title: 'Chính tả và từ vựng lớp 5',
        description: 'Kiểm tra chính tả, từ đồng nghĩa, trái nghĩa',
        subjectName: 'Ngữ văn',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Từ nào viết đúng chính tả?', options: ['Học hành', 'Họk hành', 'Hok hanh', 'Hoc hành'], answer: 0 },
            { question: 'Từ đồng nghĩa với "xinh đẹp" là:', options: ['Xấu xí', 'Dễ thương', 'Kinh khủng', 'To lớn'], answer: 1 },
            { question: 'Từ "cần cù" có nghĩa là:', options: ['Lười biếng', 'Chăm chỉ', 'Nhanh nhẹn', 'Yêu thương'], answer: 1 },
            { question: 'Chọn từ điền vào chỗ trống: "Em ... đến trường mỗi ngày"', options: ['đi', 'về', 'chạy', 'bay'], answer: 0 },
            { question: 'Từ "bạn bè" thuộc loại từ gì?', options: ['Động từ', 'Danh từ', 'Tính từ', 'Đại từ'], answer: 1 },
        ],
    },

    // TIẾNG ANH LỚP 5
    {
        title: 'Tiếng Anh lớp 5 - Từ vựng cơ bản',
        description: 'Từ vựng về động vật, thức ăn, gia đình',
        subjectName: 'Tiếng Anh',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: '"Cat" có nghĩa là gì?', options: ['Chó', 'Mèo', 'Chim', 'Cá'], answer: 1 },
            { question: '"Mother" có nghĩa là:', options: ['Bố', 'Mẹ', 'Chị', 'Em'], answer: 1 },
            { question: 'Số 15 bằng tiếng Anh là:', options: ['Fourteen', 'Fifteen', 'Sixteen', 'Fifty'], answer: 1 },
            { question: '"Red" nghĩa là màu gì?', options: ['Xanh', 'Đỏ', 'Vàng', 'Trắng'], answer: 1 },
            { question: '"Book" nghĩa là:', options: ['Bút', 'Sách', 'Bàn', 'Ghế'], answer: 1 },
        ],
    },
    {
        title: 'Tiếng Anh lớp 5 - Ngữ pháp cơ bản',
        description: 'Thì hiện tại đơn, động từ to be, đại từ',
        subjectName: 'Tiếng Anh',
        grade: [5],
        difficulty: 'medium',
        questions: [
            { question: 'I ... a student.', options: ['am', 'is', 'are', 'be'], answer: 0 },
            { question: 'She ... to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
            { question: 'How ... you?', options: ['am', 'is', 'are', 'be'], answer: 2 },
            { question: 'This is ... book.', options: ['I', 'me', 'my', 'mine'], answer: 2 },
            { question: 'They ... playing football.', options: ['am', 'is', 'are', 'be'], answer: 2 },
        ],
    },

    // ĐỊA LÝ LỚP 5
    {
        title: 'Địa lý Việt Nam lớp 5',
        description: 'Các tỉnh thành, sông ngòi, núi non nổi tiếng',
        subjectName: 'Địa lý',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Thủ đô của Việt Nam là:', options: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Huế'], answer: 0 },
            { question: 'Vịnh Hạ Long thuộc tỉnh nào?', options: ['Hải Phòng', 'Quảng Ninh', 'Thanh Hóa', 'Nghệ An'], answer: 1 },
            { question: 'Sông dài nhất Việt Nam là:', options: ['Sông Hồng', 'Sông Đồng Nai', 'Sông Cửu Long', 'Sông Hương'], answer: 2 },
            { question: 'Núi Phú Sĩ Việt Nam là núi nào?', options: ['Núi Bà Đen', 'Núi Bà Đá', 'Núi Yên Tử', 'Núi Fansipan'], answer: 0 },
            { question: 'Thành phố lớn nhất Việt Nam là:', options: ['Hà Nội', 'Đà Nẵng', 'TP.HCM', 'Hải Phòng'], answer: 2 },
        ],
    },

    // LỊCH SỬ LỚP 5
    {
        title: 'Lịch sử Việt Nam lớp 5',
        description: 'Các sự kiện lịch sử quan trọng, danh nhân',
        subjectName: 'Lịch sử',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Ngày Quốc khánh của Việt Nam là:', options: ['30/4', '2/9', '19/5', '1/5'], answer: 1 },
            { question: 'Vua Lý Thái Tổ dời đô về đâu năm 1010?', options: ['Huế', 'Hà Nội', 'Đà Nẵng', 'Ninh Bình'], answer: 1 },
            { question: 'Ai là người đọc Tuyên ngôn Độc lập 2/9/1945?', options: ['Hồ Chí Minh', 'Võ Nguyên Giáp', 'Trường Chinh', 'Phạm Văn Đồng'], answer: 0 },
            { question: 'Trận Bạch Đằng nổi tiếng do ai chỉ huy?', options: ['Lý Thường Kiệt', 'Ngô Quyền', 'Trần Hưng Đạo', 'Lê Lợi'], answer: 1 },
            { question: 'Chữ Nôm do ai sáng tạo?', options: ['Nguyễn Trãi', 'Người Việt cổ', 'Hồ Chí Minh', 'Chu Văn An'], answer: 1 },
        ],
    },

    // KHOA HỌC LỚP 5
    {
        title: 'Khoa học tự nhiên lớp 5',
        description: 'Kiến thức về thực vật, động vật, môi trường',
        subjectName: 'Sinh học',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Cây xanh tạo ra khí gì?', options: ['CO2', 'O2', 'H2O', 'N2'], answer: 1 },
            { question: 'Động vật nào là lưỡng cư?', options: ['Cá', 'Chim', 'Ếch', 'Rắn'], answer: 2 },
            { question: 'Mặt Trời mọc ở hướng nào?', options: ['Tây', 'Đông', 'Nam', 'Bắc'], answer: 1 },
            { question: 'Nước sôi ở nhiệt độ:', options: ['50°C', '100°C', '150°C', '200°C'], answer: 1 },
            { question: 'Cơ thể người có bao nhiêu giác quan?', options: ['3', '4', '5', '6'], answer: 2 },
        ],
    },

    // TIN HỌC LỚP 5
    {
        title: 'Tin học lớp 5',
        description: 'Kiến thức cơ bản về máy tính, internet an toàn',
        subjectName: 'Tin học',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Phần cứng của máy tính là:', options: ['Phần mềm', 'Bàn phím', 'Windows', 'Word'], answer: 1 },
            { question: 'Chuột máy tính dùng để làm gì?', options: ['Nghe nhạc', 'Di chuyển con trỏ', 'In tài liệu', 'Lưu file'], answer: 1 },
            { question: 'Phím nào dùng để xóa ký tự?', options: ['Enter', 'Shift', 'Delete', 'Alt'], answer: 2 },
            { question: 'Internet là gì?', options: ['Máy tính', 'Mạng toàn cầu', 'Phần mềm', 'Game'], answer: 1 },
            { question: 'Email dùng để làm gì?', options: ['Chơi game', 'Gửi thư điện tử', 'Vẽ tranh', 'Nghe nhạc'], answer: 1 },
        ],
    },

    // ĐẠO ĐỨC LỚP 5
    {
        title: 'Đạo đức lớp 5',
        description: 'Phẩm chất tốt đẹp, ứng xử văn hóa',
        subjectName: 'Giáo dục công dân',
        grade: [5],
        difficulty: 'easy',
        questions: [
            { question: 'Khi gặp thầy cô, em cần:', options: ['Chạy trốn', 'Chào hỏi', 'Im lặng', 'La hét'], answer: 1 },
            { question: 'Phẩm chất nào là tốt?', options: ['Trung thực', 'Nói dối', 'Lười biếng', 'Ích kỷ'], answer: 0 },
            { question: 'Em cần làm gì khi thấy bạn làm sai?', options: ['Im lặng', 'Nhắc nhở', 'Chế giễu', 'Đánh nhau'], answer: 1 },
            { question: 'Việc làm nào thể hiện tiết kiệm?', options: ['Tắt đèn khi ra khỏi phòng', 'Bỏ thức ăn thừa', 'Mua đồ không cần thiết', 'Dùng nước lãng phí'], answer: 0 },
            { question: 'Khi ăn cơm, em cần:', options: ['Nói chuyện ồn ào', 'Ăn văn minh', 'Chọn đồ ăn ngon', 'La hét'], answer: 1 },
        ],
    },
];

// === BÀI HỌC CHO LỚP 5 ===
const grade5Lessons = [
    // TOÁN HỌC
    {
        title: 'Phân số và các phép tính với phân số',
        description: 'Học cách rút gọn, so sánh và thực hiện phép tính với phân số',
        subjectName: 'Toán học',
        grade: [5],
        difficulty: 'intermediate',
        topics: ['Số học', 'Phân số'],
        content: `
# Phân số và các phép tính với phân số

## 1. Phân số là gì?
Phân số là cách biểu diễn một phần của tổng thể.
- **Tử số**: Số phía trên (chỉ phần lấy ra)
- **Mẫu số**: Số phía dưới (chỉ tổng số phần bằng nhau)

Ví dụ: 3/4 (ba phần tư)
- Tử số: 3
- Mẫu số: 4

## 2. Rút gọn phân số
**Cách làm**: Chia cả tử và mẫu cho ước chung lớn nhất (ƯCLN)

**Ví dụ**: Rút gọn 12/18
- ƯCLN(12, 18) = 6
- 12/18 = (12:6)/(18:6) = 2/3

## 3. Quy đồng mẫu số
Để cộng, trừ hoặc so sánh phân số, ta cần quy đồng mẫu số.

**Cách làm**: Tìm bội chung nhỏ nhất (BCNN) của các mẫu số

**Ví dụ**: Quy đồng 1/2 và 1/3
- BCNN(2, 3) = 6
- 1/2 = 3/6
- 1/3 = 2/6

## 4. So sánh phân số
- Quy đồng mẫu số
- So sánh tử số

**Ví dụ**: So sánh 2/3 và 3/4
- 2/3 = 8/12
- 3/4 = 9/12
- Vì 8 < 9 nên 2/3 < 3/4

## 5. Cộng phân số
**Công thức**: a/b + c/d = (a×d + b×c)/(b×d)

**Ví dụ**: 1/2 + 1/3
- Quy đồng: 3/6 + 2/6 = 5/6

## 6. Trừ phân số
**Công thức**: a/b - c/d = (a×d - b×c)/(b×d)

**Ví dụ**: 3/4 - 1/2
- Quy đồng: 3/4 - 2/4 = 1/4

## 7. Nhân phân số
**Công thức**: a/b × c/d = (a×c)/(b×d)

**Ví dụ**: 2/3 × 3/4 = 6/12 = 1/2

## 8. Chia phân số
**Công thức**: a/b : c/d = a/b × d/c = (a×d)/(b×c)

**Ví dụ**: 2/3 : 1/2 = 2/3 × 2/1 = 4/3

## Bài tập thực hành
1. Rút gọn: 15/20
2. Tính: 2/5 + 3/10
3. Tính: 5/6 - 1/3
4. So sánh: 3/5 và 4/7
5. Tính: 2/3 × 3/5
        `
    },
    {
        title: 'Số thập phân',
        description: 'Đọc, viết và tính toán với số thập phân',
        subjectName: 'Toán học',
        grade: [5],
        difficulty: 'intermediate',
        topics: ['Số học', 'Số thập phân'],
        content: `
# Số thập phân

## 1. Số thập phân là gì?
Số thập phân là số có dấu phẩy (,) ngăn cách phần nguyên và phần thập phân.

**Ví dụ**: 3,25
- Phần nguyên: 3
- Phần thập phân: 25

## 2. Đọc số thập phân
- Đọc phần nguyên
- Đọc "phẩy"
- Đọc từng chữ số phần thập phân

**Ví dụ**: 
- 2,5 đọc là: hai phẩy năm
- 10,75 đọc là: mười phẩy bảy mươi lăm

## 3. Viết số thập phân
**Từ phân số sang thập phân**:
- 1/2 = 0,5
- 3/4 = 0,75
- 1/5 = 0,2

## 4. So sánh số thập phân
**Cách làm**:
1. So sánh phần nguyên
2. Nếu bằng nhau, so sánh phần thập phân từ trái sang phải

**Ví dụ**: 
- 3,25 < 3,5 (vì 25 < 50)
- 2,8 > 2,75

## 5. Cộng số thập phân
**Quy tắc**: Đặt tính thẳng cột, phẩy thẳng với phẩy

**Ví dụ**: 3,25 + 1,50 = 4,75
- Đặt phẩy thẳng cột
- Cộng như số tự nhiên

## 6. Trừ số thập phân
**Quy tắc**: Đặt tính thẳng cột, phẩy thẳng với phẩy

**Ví dụ**: 5,75 - 2,25 = 3,50
- Đặt phẩy thẳng cột
- Trừ như số tự nhiên

## 7. Nhân số thập phân với số tự nhiên
**Cách làm**: 
- Nhân như số tự nhiên
- Đếm số chữ số thập phân, đặt phẩy

**Ví dụ**: 2,5 × 4 = 10,0 = 10

## 8. Chia số thập phân cho số tự nhiên
**Cách làm**: 
- Chia như số tự nhiên
- Đặt phẩy ở thương khi chia đến phần thập phân

**Ví dụ**: 7,5 : 3 = 2,5

## Bài tập thực hành
1. So sánh: 3,45 và 3,5
2. Tính: 5,25 + 2,75
3. Tính: 10 - 3,6
4. Tính: 2,5 × 8
5. Tính: 15,6 : 4
        `
    },
    {
        title: 'Hình học: Chu vi và Diện tích',
        description: 'Tính chu vi, diện tích các hình cơ bản',
        subjectName: 'Toán học',
        grade: [5],
        difficulty: 'intermediate',
        topics: ['Hình học', 'Đo lường'],
        content: `
# Chu vi và Diện tích các hình

## 1. Hình vuông

### Chu vi
**Công thức**: P = a × 4 (hoặc P = 4a)
- a: cạnh hình vuông

**Ví dụ**: Hình vuông cạnh 5cm
- Chu vi = 5 × 4 = 20cm

### Diện tích
**Công thức**: S = a × a = a²
- a: cạnh hình vuông

**Ví dụ**: Hình vuông cạnh 6cm
- Diện tích = 6 × 6 = 36cm²

## 2. Hình chữ nhật

### Chu vi
**Công thức**: P = (a + b) × 2
- a: chiều dài
- b: chiều rộng

**Ví dụ**: HCN dài 8cm, rộng 5cm
- Chu vi = (8 + 5) × 2 = 26cm

### Diện tích
**Công thức**: S = a × b
- a: chiều dài
- b: chiều rộng

**Ví dụ**: HCN dài 10cm, rộng 6cm
- Diện tích = 10 × 6 = 60cm²

## 3. Hình tam giác

### Chu vi
**Công thức**: P = a + b + c
- a, b, c: ba cạnh tam giác

### Diện tích
**Công thức**: S = (a × h) : 2
- a: đáy
- h: chiều cao

**Ví dụ**: Tam giác có đáy 8cm, cao 6cm
- Diện tích = (8 × 6) : 2 = 24cm²

## 4. Hình bình hành

### Diện tích
**Công thức**: S = a × h
- a: đáy
- h: chiều cao

**Ví dụ**: Hình bình hành đáy 10cm, cao 5cm
- Diện tích = 10 × 5 = 50cm²

## 5. Hình thang

### Diện tích
**Công thức**: S = ((a + b) × h) : 2
- a, b: hai đáy
- h: chiều cao

**Ví dụ**: Hình thang đáy lớn 12cm, đáy nhỏ 8cm, cao 5cm
- Diện tích = ((12 + 8) × 5) : 2 = 50cm²

## Bài tập thực hành
1. Tính chu vi hình vuông cạnh 7cm
2. Tính diện tích HCN dài 15cm, rộng 8cm
3. Tính diện tích tam giác đáy 10cm, cao 8cm
4. Tính chu vi HCN dài 12cm, rộng 7cm
5. Tính diện tích hình thang có đáy lớn 10cm, đáy nhỏ 6cm, cao 4cm
        `
    },

    // TIẾNG VIỆT
    {
        title: 'Các loại từ trong Tiếng Việt',
        description: 'Nhận biết và phân loại danh từ, động từ, tính từ',
        subjectName: 'Ngữ văn',
        grade: [5],
        difficulty: 'beginner',
        topics: ['Ngữ pháp', 'Từ loại'],
        content: `
# Các loại từ trong Tiếng Việt

## 1. Danh từ
Danh từ chỉ tên gọi của người, vật, hiện tượng.

**Ví dụ**: 
- Con người: mẹ, bố, em, thầy, cô
- Đồ vật: bàn, ghế, sách, bút
- Hiện tượng: mưa, gió, sấm, chớp

**Cách nhận biết**: Trả lời câu hỏi "ai?" hoặc "cái gì?"

## 2. Động từ
Động từ chỉ hành động, trạng thái.

**Ví dụ**: 
- Hành động: chạy, nhảy, đi, ăn, ngủ
- Trạng thái: buồn, vui, lo, sợ

**Cách nhận biết**: Trả lời câu hỏi "làm gì?"

## 3. Tính từ
Tính từ chỉ tính chất, đặc điểm của người, vật.

**Ví dụ**: 
- Màu sắc: đỏ, xanh, vàng, trắng
- Kích thước: to, nhỏ, cao, thấp
- Tính chất: đẹp, xấu, tốt, xấu

**Cách nhận biết**: Trả lời câu hỏi "thế nào?"

## 4. Đại từ
Đại từ dùng để thay thế cho danh từ.

**Ví dụ**: 
- Đại từ xưng hô: tôi, bạn, anh, chị, em
- Đại từ chỉ định: này, kia, đó, ấy
- Đại từ nghi vấn: ai, gì, nào, đâu

## 5. Số từ
Số từ chỉ số lượng, thứ tự.

**Ví dụ**: 
- Số lượng: một, hai, ba, nhiều, ít
- Thứ tự: thứ nhất, thứ hai, thứ ba

## 6. Liên từ
Liên từ nối các từ, cụm từ, câu.

**Ví dụ**: và, hoặc, nhưng, mà, vì

## Bài tập thực hành
Xác định loại từ:
1. Sách (danh từ)
2. Chạy (động từ)
3. Đẹp (tính từ)
4. Tôi (đại từ)
5. Ba (số từ)
        `
    },

    // TIẾNG ANH
    {
        title: 'Present Simple Tense - Thì hiện tại đơn',
        description: 'Cách dùng và cấu trúc thì hiện tại đơn trong tiếng Anh',
        subjectName: 'Tiếng Anh',
        grade: [5],
        difficulty: 'intermediate',
        topics: ['Ngữ pháp', 'Thì'],
        content: `
# Present Simple Tense (Thì hiện tại đơn)

## 1. Công dụng
Dùng để diễn tả:
- Thói quen hàng ngày
- Sự thật hiển nhiên
- Lịch trình cố định

## 2. Cấu trúc

### Câu khẳng định
**Với I/You/We/They**: S + V (nguyên mẫu)
- I play football.
- They go to school.

**Với He/She/It**: S + V-s/es
- He plays football.
- She goes to school.

### Câu phủ định
**Với I/You/We/They**: S + don't + V
- I don't like milk.

**Với He/She/It**: S + doesn't + V
- He doesn't like milk.

### Câu nghi vấn
**Với I/You/We/They**: Do + S + V?
- Do you like milk?

**Với He/She/It**: Does + S + V?
- Does he like milk?

## 3. Cách thêm s/es

### Thêm -s
- play → plays
- eat → eats
- read → reads

### Thêm -es (kết thúc bằng -o, -s, -x, -ch, -sh)
- go → goes
- watch → watches
- wash → washes

### Đổi -y thành -ies (kết thúc bằng phụ âm + y)
- study → studies
- fly → flies

## 4. Trạng từ tần suất
- Always (luôn luôn)
- Usually (thường xuyên)
- Often (thường)
- Sometimes (đôi khi)
- Rarely (hiếm khi)
- Never (không bao giờ)

**Ví dụ**: 
- I always brush my teeth.
- She usually goes to school at 7am.

## Bài tập thực hành
1. I (go) ___ to school every day.
2. She (play) ___ badminton.
3. They (not like) ___ fish.
4. (Do) ___ you eat breakfast?
5. He (study) ___ English.
        `
    },

    // ĐỊA LÝ
    {
        title: 'Bản đồ Việt Nam - Vị trí địa lý',
        description: 'Tìm hiểu về vị trí, hình dạng lãnh thổ Việt Nam',
        subjectName: 'Địa lý',
        grade: [5],
        difficulty: 'beginner',
        topics: ['Địa lý Việt Nam', 'Bản đồ'],
        content: `
# Bản đồ Việt Nam

## 1. Vị trí địa lý
Việt Nam nằm ở:
- **Châu lục**: Đông Nam Á
- **Bán đảo**: Đông Dương
- **Toạ độ**: 8°-23° Vĩ Bắc, 102°-110° Kinh Đông

### Giáp với:
- **Phía Bắc**: Trung Quốc
- **Phía Tây**: Lào, Campuchia
- **Phía Đông**: Biển Đông
- **Phía Nam**: Biển Đông

## 2. Hình dạng lãnh thổ
- **Hình dạng**: Chữ S
- **Chiều dài**: ~1.650 km (Bắc - Nam)
- **Chiều rộng**: 
  - Hẹp nhất: 50 km (Quảng Bình)
  - Rộng nhất: 600 km (Bắc)

## 3. Đặc điểm địa hình
### Miền Bắc
- Đồng bằng sông Hồng
- Vùng núi cao: Hoàng Liên Sơn
- Núi cao nhất: Fansipan (3.143m)

### Miền Trung
- Địa hình hẹp
- Nhiều đèo núi
- Bờ biển dài

### Miền Nam
- Đồng bằng sông Cửu Long
- Địa hình bằng phẳng
- Đất phù sa màu mỡ

## 4. Các vùng miền
Việt Nam chia thành 3 miền:
1. **Miền Bắc**: Hà Nội, Hải Phòng...
2. **Miền Trung**: Đà Nẵng, Huế, Nha Trang...
3. **Miền Nam**: TP.HCM, Cần Thơ...

## 5. Sông ngòi
### Sông lớn:
- Sông Hồng (Bắc Bộ)
- Sông Mekong/Cửu Long (Nam Bộ)
- Sông Đồng Nai
- Sông Hương

## 6. Biển đảo
- **Biển Đông**: Bờ biển dài ~3.260 km
- **Quần đảo**: Hoàng Sa, Trường Sa
- **Vịnh**: Hạ Long, Nha Trang, Vân Phong

## Bài tập
1. Việt Nam giáp bao nhiêu nước?
2. Núi cao nhất Việt Nam là gì?
3. Kể tên 2 sông lớn ở Việt Nam
4. Thủ đô Việt Nam là gì?
5. Thành phố lớn nhất miền Nam là gì?
        `
    },

    // LỊCH SỬ
    {
        title: 'Lịch sử dựng nước và giữ nước',
        description: 'Các sự kiện lịch sử quan trọng của Việt Nam',
        subjectName: 'Lịch sử',
        grade: [5],
        difficulty: 'beginner',
        topics: ['Lịch sử Việt Nam', 'Danh nhân'],
        content: `
# Lịch sử Việt Nam

## 1. Thời kỳ dựng nước

### Vua Hùng dựng nước
- **Thời gian**: Khoảng 2879 trước CN
- **Quốc hiệu**: Văn Lang
- **Vùng đất**: Đồng bằng sông Hồng
- **Ý nghĩa**: Tổ tiên người Việt

### Họng Bàng thị
- 18 đời Vua Hùng
- Dạy dân trồng lúa nước
- Xây dựng nền văn minh Đông Sơn

## 2. Thời kỳ Bắc thuộc
**Thời gian**: 111 TCN - 938 SCN (~1000 năm)

### Các cuộc khởi nghĩa:
- **Hai Bà Trưng** (40-43): Khởi nghĩa chống Hán
- **Bà Triệu** (248): "Tôi muốn cưỡi cơn gió mạnh..."

## 3. Thời kỳ Tự chủ

### Ngô Quyền (938)
- **Chiến thắng**: Bạch Đằng
- **Ý nghĩa**: Chấm dứt Bắc thuộc

### Đinh Bộ Lĩnh (968)
- Thống nhất đất nước
- Lấy quốc hiệu "Đại Cồ Việt"

### Lý Thái Tổ (1010)
- Dời đô về Thăng Long (Hà Nội)
- "Chiếu dời đô"

### Trần Hưng Đạo (thế kỷ 13)
- Đánh thắng quân Nguyên-Mông 3 lần
- "Giặc đến nhà đàn bà cũng đánh"

### Lê Lợi (1428)
- Khởi nghĩa Lam Sơn
- Đánh đuổi quân Minh
- Người phụ trách: Nguyễn Trãi

## 4. Thời kỳ cận đại

### Hồ Chí Minh (1890-1969)
- **1930**: Thành lập Đảng Cộng sản Việt Nam
- **2/9/1945**: Đọc Tuyên ngôn Độc lập
- **1954**: Chiến thắng Điện Biên Phủ
- **30/4/1975**: Giải phóng miền Nam

## 5. Các ngày lễ quan trọng
- **10/3**: Ngày Giỗ Tổ Hùng Vương
- **30/4**: Ngày Giải phóng miền Nam
- **1/5**: Ngày Quốc tế Lao động
- **2/9**: Ngày Quốc khánh

## Bài tập
1. Ai là tổ tiên người Việt?
2. Trận Bạch Đằng do ai chỉ huy?
3. Lý Thái Tổ dời đô về đâu?
4. Ai đọc Tuyên ngôn Độc lập?
5. Ngày Quốc khánh là ngày nào?
        `
    },

    // KHOA HỌC
    {
        title: 'Thực vật và Động vật',
        description: 'Phân loại sinh vật, đặc điểm của thực vật và động vật',
        subjectName: 'Sinh học',
        grade: [5],
        difficulty: 'beginner',
        topics: ['Sinh vật', 'Môi trường'],
        content: `
# Thực vật và Động vật

## 1. Thực vật

### Đặc điểm
- Có rễ, thân, lá
- Quang hợp (tạo thức ăn từ ánh sáng)
- Không di chuyển

### Các bộ phận
**Rễ**: 
- Hút nước, chất dinh dưỡng
- Giữ cây đứng vững

**Thân**:
- Dẫn nước, dinh dưỡng
- Nâng đỡ cây

**Lá**:
- Quang hợp
- Tạo oxy (O₂)
- Hấp thụ khí CO₂

**Hoa**:
- Sinh sản
- Tạo quả, hạt

### Phân loại
- **Cây gỗ**: Cứng, sống lâu (Sưa, Tếch)
- **Cây bụi**: Thấp, nhiều cành (Hồng, Chanh)
- **Cây thảo**: Thân mềm (Rau, hoa)

## 2. Động vật

### Đặc điểm
- Di chuyển được
- Ăn sẵn (không tự tạo thức ăn)
- Có hệ thần kinh

### Phân loại theo môi trường sống

**Động vật trên cạn**:
- Voi, hổ, chó, mèo
- Thở bằng phổi

**Động vật dưới nước**:
- Cá, tôm, cua
- Thở bằng mang

**Động vật lưỡng cư**:
- Ếch, nhái
- Sống cả trên cạn và dưới nước

**Động vật trên không**:
- Chim, dơi
- Có cánh, bay được

### Phân loại theo thức ăn

**Ăn cỏ** (Động vật ăn thực vật):
- Bò, dê, thỏ, ngựa

**Ăn thịt** (Động vật ăn động vật):
- Hổ, sư tử, đại bàng

**Ăn tạp** (Ăn cả thực vật và động vật):
- Gấu, lợn, người

## 3. Chuỗi thức ăn
Cỏ → Thỏ → Hổ
- Cỏ: Sinh vật sản xuất
- Thỏ: Sinh vật tiêu thụ bậc 1
- Hổ: Sinh vật tiêu thụ bậc 2

## 4. Bảo vệ sinh vật
- Không săn bắt động vật quý hiếm
- Không phá rừng
- Trồng cây xanh
- Giữ gìn môi trường sạch

## Bài tập
1. Lá cây tạo ra khí gì?
2. Kể 3 loại động vật sống dưới nước
3. Động vật nào là lưỡng cư?
4. Phân loại: Gấu là động vật ăn gì?
5. Tại sao cần bảo vệ động vật?
        `
    },
];

// === GỢI Ý BÀI HỌC CHO LỚP 5 ===
const grade5Suggestions = [
    {
        title: 'Khởi đầu với Toán học lớp 5',
        description: 'Bắt đầu học kỳ mới với các khái niệm toán học cơ bản: phân số, số thập phân và hình học',
        subjectName: 'Toán học',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Phân số', 'Số thập phân', 'Hình học'],
        duration: 90,
        icon: 'calculate',
        color: '#2196F3',
        order: 1
    },
    {
        title: 'Làm chủ Phân số',
        description: 'Nắm vững cách rút gọn, so sánh và tính toán với phân số - nền tảng quan trọng cho toán cao hơn',
        subjectName: 'Toán học',
        grade: 5,
        difficulty: 'intermediate',
        topics: ['Phân số', 'Tối giản', 'Quy đồng'],
        duration: 60,
        icon: 'functions',
        color: '#2196F3',
        order: 2
    },
    {
        title: 'Số thập phân trong cuộc sống',
        description: 'Khám phá ứng dụng số thập phân trong đời sống: tiền bạc, đo lường, tính toán hàng ngày',
        subjectName: 'Toán học',
        grade: 5,
        difficulty: 'intermediate',
        topics: ['Số thập phân', 'Ứng dụng thực tế'],
        duration: 45,
        icon: 'attach_money',
        color: '#2196F3',
        order: 3
    },
    {
        title: 'Hình học cơ bản',
        description: 'Tính chu vi, diện tích các hình: vuông, chữ nhật, tam giác - kỹ năng thiết yếu',
        subjectName: 'Toán học',
        grade: 5,
        difficulty: 'intermediate',
        topics: ['Hình học', 'Chu vi', 'Diện tích'],
        duration: 50,
        icon: 'crop_square',
        color: '#2196F3',
        order: 4
    },
    {
        title: 'Ngữ văn lớp 5 - Nền tảng',
        description: 'Học các loại từ, câu và kỹ năng đọc hiểu để phát triển tư duy ngôn ngữ',
        subjectName: 'Ngữ văn',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Từ loại', 'Câu', 'Đọc hiểu'],
        duration: 60,
        icon: 'menu_book',
        color: '#00BCD4',
        order: 5
    },
    {
        title: 'Kỹ năng viết và chính tả',
        description: 'Rèn luyện kỹ năng viết đoạn văn, bài văn và cải thiện chính tả tiếng Việt',
        subjectName: 'Ngữ văn',
        grade: 5,
        difficulty: 'intermediate',
        topics: ['Viết văn', 'Chính tả', 'Từ vựng'],
        duration: 55,
        icon: 'edit',
        color: '#00BCD4',
        order: 6
    },
    {
        title: 'Tiếng Anh cơ bản cho người mới',
        description: 'Làm quen với từ vựng, ngữ pháp cơ bản và cách giao tiếp đơn giản bằng tiếng Anh',
        subjectName: 'Tiếng Anh',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Alphabet', 'Numbers', 'Greetings', 'Family'],
        duration: 50,
        icon: 'translate',
        color: '#9C27B0',
        order: 7
    },
    {
        title: 'Present Simple - Thì hiện tại đơn',
        description: 'Nắm vững thì cơ bản nhất trong tiếng Anh, dùng để nói về thói quen và sự thật',
        subjectName: 'Tiếng Anh',
        grade: 5,
        difficulty: 'intermediate',
        topics: ['Grammar', 'Present Simple', 'Daily routine'],
        duration: 45,
        icon: 'schedule',
        color: '#9C27B0',
        order: 8
    },
    {
        title: 'Khám phá Việt Nam',
        description: 'Tìm hiểu về đất nước, con người và địa lý Việt Nam - quê hương yêu dấu',
        subjectName: 'Địa lý',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Bản đồ', 'Tỉnh thành', 'Sông ngòi', 'Núi non'],
        duration: 50,
        icon: 'map',
        color: '#795548',
        order: 9
    },
    {
        title: 'Lịch sử Việt Nam anh hùng',
        description: 'Học về các vị anh hùng dân tộc và những sự kiện lịch sử quan trọng',
        subjectName: 'Lịch sử',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Vua Hùng', 'Hai Bà Trưng', 'Trần Hưng Đạo', 'Hồ Chí Minh'],
        duration: 55,
        icon: 'military_tech',
        color: '#FF9800',
        order: 10
    },
    {
        title: 'Thế giới sinh vật',
        description: 'Khám phá thực vật, động vật và môi trường sống xung quanh chúng ta',
        subjectName: 'Sinh học',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Thực vật', 'Động vật', 'Môi trường', 'Chuỗi thức ăn'],
        duration: 50,
        icon: 'pets',
        color: '#009688',
        order: 11
    },
    {
        title: 'Tin học cho trẻ em',
        description: 'Làm quen với máy tính, internet an toàn và các ứng dụng cơ bản',
        subjectName: 'Tin học',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Máy tính', 'Internet', 'An toàn mạng'],
        duration: 40,
        icon: 'computer',
        color: '#3F51B5',
        order: 12
    },
    {
        title: 'Phẩm chất tốt đẹp',
        description: 'Học cách làm người tốt, yêu thương gia đình và tôn trọng mọi người',
        subjectName: 'Giáo dục công dân',
        grade: 5,
        difficulty: 'beginner',
        topics: ['Đạo đức', 'Ứng xử', 'Gia đình', 'Bạn bè'],
        duration: 35,
        icon: 'favorite',
        color: '#FFC107',
        order: 13
    },
    {
        title: 'Ôn tập tổng hợp học kỳ 1',
        description: 'Tổng hợp kiến thức các môn học kỳ 1, chuẩn bị cho kiểm tra cuối kỳ',
        subjectName: 'Tổng hợp',
        grade: 5,
        difficulty: 'intermediate',
        topics: ['Toán', 'Văn', 'Anh', 'Địa lý', 'Lịch sử'],
        duration: 90,
        icon: 'assignment',
        color: '#607D8B',
        order: 14
    },
    {
        title: 'Ôn tập tổng hợp học kỳ 2',
        description: 'Củng cố toàn bộ kiến thức năm học, sẵn sàng cho kỳ thi lên lớp 6',
        subjectName: 'Tổng hợp',
        grade: 5,
        difficulty: 'advanced',
        topics: ['Tổng hợp', 'Ôn tập', 'Nâng cao'],
        duration: 120,
        icon: 'school',
        color: '#607D8B',
        order: 15
    }
];

module.exports = {
    grade5Quizzes,
    grade5Lessons,
    grade5Suggestions
};
