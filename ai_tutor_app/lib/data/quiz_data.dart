// Dữ liệu mẫu cho bài tập luyện tập
final List<Map<String, dynamic>> quizList = [
  {
    'title': 'Toán học cơ bản',
    'description': 'Kiểm tra kiến thức toán học cơ bản.',
    'questions': [
      {
        'question': '2 + 2 = ?',
        'options': ['3', '4', '5', '6'],
        'answer': 1,
      },
      {
        'question': '5 x 3 = ?',
        'options': ['8', '15', '10', '20'],
        'answer': 1,
      },
    ],
  },
  {
    'title': 'Tiếng Anh cơ bản',
    'description': 'Kiểm tra từ vựng tiếng Anh cơ bản.',
    'questions': [
      {
        'question': 'Dog nghĩa là gì?',
        'options': ['Mèo', 'Chó', 'Cá', 'Chim'],
        'answer': 1,
      },
      {
        'question': 'Apple là quả gì?',
        'options': ['Cam', 'Chuối', 'Táo', 'Nho'],
        'answer': 2,
      },
    ],
  },
  {
    'title': 'Lịch sử Việt Nam',
    'description': 'Kiểm tra kiến thức lịch sử Việt Nam.',
    'questions': [
      {
        'question': 'Năm 1945, sự kiện nào diễn ra ở Việt Nam?',
        'options': ['Cách mạng tháng Tám', 'Chiến tranh thế giới thứ hai', 'Khởi nghĩa Lam Sơn', 'Chiến dịch Điện Biên Phủ'],
        'answer': 0,
      },
      {
        'question': 'Ai là người đọc Tuyên ngôn Độc lập ngày 2/9/1945?',
        'options': ['Trần Hưng Đạo', 'Hồ Chí Minh', 'Lê Lợi', 'Ngô Quyền'],
        'answer': 1,
      },
    ],
  },
  {
    'title': 'Khoa học tự nhiên',
    'description': 'Kiểm tra kiến thức khoa học tự nhiên.',
    'questions': [
      {
        'question': 'Nước có công thức hóa học là gì?',
        'options': ['CO2', 'H2O', 'O2', 'NaCl'],
        'answer': 1,
      },
      {
        'question': 'Trái Đất quay quanh gì?',
        'options': ['Mặt Trăng', 'Sao Hỏa', 'Mặt Trời', 'Sao Kim'],
        'answer': 2,
      },
    ],
  },
  {
    'title': 'Địa lý Việt Nam',
    'description': 'Kiểm tra kiến thức địa lý Việt Nam.',
    'questions': [
      {
        'question': 'Thủ đô của Việt Nam là gì?',
        'options': ['Hà Nội', 'TP Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'],
        'answer': 0,
      },
      {
        'question': 'Sông Hồng chảy qua thành phố nào?',
        'options': ['Hải Phòng', 'Hà Nội', 'Huế', 'Nha Trang'],
        'answer': 1,
      },
    ],
  },
  {
    'title': 'Văn học Việt Nam',
    'description': 'Kiểm tra kiến thức văn học Việt Nam.',
    'questions': [
      {
        'question': 'Tác giả của bài thơ "Tây Tiến" là ai?',
        'options': ['Tố Hữu', 'Quang Dũng', 'Xuân Diệu', 'Chế Lan Viên'],
        'answer': 1,
      },
      {
        'question': 'Ai là tác giả của tác phẩm "Chí Phèo"?',
        'options': ['Nam Cao', 'Ngô Tất Tố', 'Nguyễn Tuân', 'Nguyễn Minh Châu'],
        'answer': 0,
      },
    ],
  },
  {
    'title': 'Tin học cơ bản',
    'description': 'Kiểm tra kiến thức tin học cơ bản.',
    'questions': [
      {
        'question': 'Hệ điều hành phổ biến nhất hiện nay là gì?',
        'options': ['Windows', 'Linux', 'macOS', 'Android'],
        'answer': 0,
      },
      {
        'question': 'HTML là viết tắt của từ gì?',
        'options': ['HyperText Markup Language', 'HighText Markup Language', 'HyperText Markdown Language', 'HighText Markdown Language'],
        'answer': 0,
      },
    ],
  },
  {
    'title': 'Giáo dục công dân',
    'description': 'Kiểm tra kiến thức giáo dục công dân.',
    'questions': [
      {
        'question': 'Quyền nào sau đây không phải là quyền cơ bản của công dân?',
        'options': ['Quyền tự do ngôn luận', 'Quyền bầu cử', 'Quyền sở hữu tài sản', 'Quyền được bảo vệ bí mật đời tư'],
        'answer': 3,
      },
      {
        'question': 'Luật pháp Việt Nam quy định độ tuổi tối thiểu để kết hôn là bao nhiêu?',
        'options': ['16 tuổi', '18 tuổi', '20 tuổi', '22 tuổi'],
        'answer': 1,
      },
    ],
  },
  {
    'title': 'Giáo dục thể chất',
    'description': 'Kiểm tra kiến thức giáo dục thể chất.',
    'questions': [
      {
        'question': 'Môn thể thao nào được coi là vua của các môn thể thao?',
        'options': ['Bóng đá', 'Bóng rổ', 'Bóng chuyền', 'Cầu lông'],
        'answer': 0,
      },
      {
        'question': 'Chạy marathon có độ dài bao nhiêu km?',
        'options': ['21 km', '42 km', '50 km', '100 km'],
        'answer': 1,
      },
    ],
  },
  {
    'title': 'Âm nhạc cơ bản',
    'description': 'Kiểm tra kiến thức âm nhạc cơ bản.',
    'questions': [
      {
        'question': 'Nhạc sĩ nào sáng tác bài hát "Nối vòng tay lớn"?',
        'options': ['Trịnh Công Sơn', 'Phạm Duy', 'Ngô Thụy Miên', 'Vũ Thành An'],
        'answer': 0,
      },
      {
        'question': 'Âm nhạc cổ điển châu Âu thường được biểu diễn bằng nhạc cụ nào?',
        'options': ['Piano', 'Guitar', 'Trống', 'Violin'],
        'answer': 3,
      },
    ],
  },
  {
    'title': 'Nghệ thuật thị giác',
    'description': 'Kiểm tra kiến thức nghệ thuật thị giác.',
    'questions': [
      {
        'question': 'Ai là họa sĩ nổi tiếng với bức tranh "Mona Lisa"?',
        'options': ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
        'answer': 2,
      },
      {
        'question': 'Trường phái hội họa nào sử dụng màu sắc tươi sáng và hình ảnh trừu tượng?',
        'options': ['Impressionism', 'Cubism', 'Surrealism', 'Abstract'],
        'answer': 3,
      },
    ],
  },
  {
    'title': 'Kỹ năng sống',
    'description': 'Kiểm tra kiến thức kỹ năng sống.',
    'questions': [
      {
        'question': 'Kỹ năng nào sau đây không phải là kỹ năng sống cơ bản?',
        'options': ['Giao tiếp', 'Quản lý thời gian', 'Lập kế hoạch tài chính', 'Chơi game'],
        'answer': 3,
      },
      {
        'question': 'Kỹ năng nào giúp bạn giải quyết xung đột hiệu quả?',
        'options': ['Lắng nghe', 'Nói to', 'Tránh né', 'Chỉ trích'],
        'answer': 0,
      },
    ],
  },
  {
    'title': 'Kỹ năng lập trình cơ bản',
    'description': 'Kiểm tra kiến thức lập trình cơ bản.',
    'questions': [
      {
        'question': 'Ngôn ngữ lập trình nào được sử dụng phổ biến nhất hiện nay?',
        'options': ['Python', 'JavaScript', 'Java', 'C++'],
        'answer': 1,
      },
      {
        'question': 'Biến trong lập trình là gì?',
        'options': ['Một loại hàm', 'Một loại dữ liệu', 'Một vùng nhớ để lưu trữ giá trị', 'Một cấu trúc điều khiển'],
        'answer': 2,
      },
    ],
  },
];

