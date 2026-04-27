const mongoose = require('mongoose');
const Subject = require('../src/models/Subject');
const Lesson = require('../src/models/Lesson');
const Quiz = require('../src/models/Quiz');
const LessonSuggestion = require('../src/models/LessonSuggestion');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learning_db';

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('📦 Connected to MongoDB');
    } catch (error) {
        console.error('Failed', error);
        process.exit(1);
    }
};

const syllabus = {
    "Toán học": {
        1: [
            { title: "Các số trong phạm vi 10", desc: "Nhận biết, đọc, viết các số từ 0 đến 10.", content: "Học sinh sẽ học cách đếm các đồ vật, nhận biết các mặt số từ 0 đến 10, so sánh lớn bé." },
            { title: "Phép cộng và phép trừ trong phạm vi 10", desc: "Thực hiện các phép tính cơ bản.", content: "Giới thiệu dấu +, -, =. Thực hành cộng trừ qua các hình ảnh trực quan." },
            { title: "Hình vuông, hình tròn, hình tam giác", desc: "Nhận biết các hình khối cơ bản.", content: "Ghép hình, phân biệt hình vuông, tròn, tam giác qua đồ vật thực tế." }
        ],
        2: [
            { title: "Phép cộng có nhớ trong phạm vi 100", desc: "Kỹ năng tính toán nâng cao hơn.", content: "Cách đặt tính rồi tính, làm quen với việc nhớ sang hàng chục." },
            { title: "Phép trừ có nhớ trong phạm vi 100", desc: "Thực hành trừ mượn.", content: "Cách mượn 1 chục ở hàng chục để thực hiện phép trừ hàng đơn vị." },
            { title: "Đơn vị đo độ dài: dm, m, km", desc: "Đo lường cơ bản.", content: "Cách dùng thước kẻ, sự chuyển đổi 1m = 10dm, 1km = 1000m." }
        ],
        3: [
            { title: "Bảng nhân chia từ 2 đến 9", desc: "Học thuộc lòng bảng cửu chương.", content: "Luyện tập học thuộc bảng cửu chương, áp dụng giải toán có lời văn." },
            { title: "Các số trong phạm vi 10.000", desc: "Làm quen với số có 4 chữ số.", content: "Cách đọc, viết số nghìn, trăm, chục, đơn vị." },
            { title: "Chu vi hình chữ nhật, hình vuông", desc: "Tính toán hình học", content: "Công thức P = (a+b)*2 đối với HCN và P = a*4 đối với HV." }
        ],
        4: [
            { title: "Phân số", desc: "Khái niệm phân số và các phép tính.", content: "Tử số, mẫu số, quy đồng mẫu số, cộng trừ nhân chia phân số." },
            { title: "Góc nhọn, góc bẹt, góc tù", desc: "Đo lường góc", content: "Sử dụng thước đo độ (thước e-ke) để xác định góc." },
            { title: "Dấu hiệu chia hết cho 2, 3, 5, 9", desc: "Quy luật số học", content: "Số tận cùng là chẵn chia hết cho 2, tổng các chữ số chia hết cho 9..." }
        ],
        5: [
            { title: "Số thập phân", desc: "Đọc, viết, và cấu tạo số thập phân.", content: "Phần nguyên và phần thập phân, hàng phần mười, phần trăm, phần nghìn." },
            { title: "Tính diện tích hình thang, hình tròn", desc: "Hình học nâng cao.", content: "Công thức tính diện tích S = (a+b)*h/2 (Hình thang), S = r*r*3.14 (Hình tròn)." },
            { title: "Toán chuyển động: Vận tốc, Quãng đường, Thời gian", desc: "Toán thực tế", content: "Các công thức cơ bản: v = s/t, s = v*t, t = s/v." }
        ]
    },
    "Ngữ văn": { // Được hiểu là môn Tiếng Việt ở Tiểu học
        1: [
            { title: "Làm quen chữ cái và vần", desc: "Học bảng chữ cái Tiếng Việt.", content: "Các chữ cái a, b, c, các nguyên âm và phụ âm, ghép vần đơn giản." },
            { title: "Tập đọc: Bài học đầu tiên", desc: "Đọc trơn văn bản ngắn.", content: "Đọc truyện ngắn, ca dao, đồng dao. Không đánh vần mà đọc trơn." }
        ],
        2: [
            { title: "Từ chỉ sự vật, hoạt động", desc: "Luyện từ và câu.", content: "Nhận biết danh từ, động từ qua các câu văn mẫu." },
            { title: "Tập làm văn: Viết đoạn văn ngắn về gia đình", desc: "Viết sáng tạo.", content: "Viết 3-5 câu miêu tả về người thân trong gia đình." }
        ],
        3: [
            { title: "Câu kiểu: Ai làm gì? Ai thế nào?", desc: "Mẫu câu cơ bản.", content: "Phân tích cấu trúc chủ ngữ - vị ngữ trong câu." },
            { title: "Tập làm văn: Viết thư", desc: "Kỹ năng thực tế.", content: "Form định dạng một bức thư: Địa điểm, ngày tháng, lời chào, nội dung, chữ ký." }
        ],
        4: [
            { title: "Trạng ngữ trong câu", desc: "Luyện từ và câu lớp 4.", content: "Trạng ngữ chỉ thời gian, nơi chốn, mục đích, nguyên nhân." },
            { title: "Tập làm văn: Miêu tả đồ vật", desc: "Văn miêu tả.", content: "Cấu trúc mở bài, thân bài (tả bao quát, tả chi tiết), kết bài." }
        ],
        5: [
            { title: "Từ đồng nghĩa, từ trái nghĩa", desc: "Từ vựng nâng cao.", content: "Cách sử dụng từ đồng nghĩa trong các hoàn cảnh khác nhau, từ nhiều nghĩa." },
            { title: "Tập làm văn: Miêu tả phong cảnh", desc: "Văn tả cảnh.", content: "Sử dụng các biện pháp tu từ như nhân hóa, so sánh để bài văn sinh động." }
        ]
    },
    "Tiếng Anh": {
        3: [
            { title: "Unit 1: Hello!", desc: "Chào hỏi cơ bản.", content: "Vocabulary: Hello, Hi, Name. Grammar: What is your name? I am..." },
            { title: "Unit 2: Colors and Numbers", desc: "Màu sắc và số đếm.", content: "Colors: Red, Blue, Green. Numbers: One to Ten." }
        ],
        4: [
            { title: "Unit 1: Daily routines", desc: "Các hoạt động hàng ngày.", content: "Vocabulary: get up, have breakfast, go to school. Grammar: What time do you...?" },
            { title: "Unit 2: Animals", desc: "Các loài vật.", content: "Vocabulary: Elephant, Tiger, Monkey. Grammar: They are..." }
        ],
        5: [
            { title: "Unit 1: Future Jobs", desc: "Nghề nghiệp tương lai.", content: "Vocabulary: Doctor, Engineer, Teacher. Grammar: What would you like to be in the future?" },
            { title: "Unit 2: The environment", desc: "Môi trường.", content: "Vocabulary: Tree, River, Pollution. Grammar: We should / shouldn't..." }
        ]
    },
    "Lịch sử": {
        4: [
            { title: "Nước Văn Lang - Âu Lạc", desc: "Buổi đầu dựng nước.", content: "Sự ra đời của nhà nước Văn Lang, các vua Hùng, thành Cổ Loa, An Dương Vương." },
            { title: "Khởi nghĩa Hai Bà Trưng", desc: "Chống giặc ngoại xâm thưở xưa.", content: "Cuộc khởi nghĩa năm 40 chống ách đô hộ của nhà Hán." }
        ],
        5: [
            { title: "Cách mạng tháng Tám 1945", desc: "Mốc son lịch sử.", content: "Diễn biến khởi nghĩa giành chính quyền tại Hà Nội và cả nước. Bác Hồ đọc Tuyên ngôn độc lập." },
            { title: "Chiến thắng Điện Biên Phủ", desc: "Lừng lẫy năm châu.", content: "Chiến dịch 56 ngày đêm khoét núi ngủ hầm, kết thúc thắng lợi cuộc kháng chiến chống Pháp." }
        ]
    }
};

const run = async () => {
    await connectDB();
    
    const dbSubjects = await Subject.find();
    const subjectMap = {};
    dbSubjects.forEach(s => { subjectMap[s.name] = s; });
    
    let lessons = [];
    let quizzes = [];
    
    for (const [subName, grades] of Object.entries(syllabus)) {
        const subDoc = subjectMap[subName];
        if (!subDoc) {
            console.log("Missing subject in DB:", subName);
            continue;
        }
        
        for (const [gradeStr, items] of Object.entries(grades)) {
            const grade = parseInt(gradeStr);
            
            items.forEach((item, idx) => {
                const lessonId = new mongoose.Types.ObjectId();
                
                lessons.push({
                    _id: lessonId,
                    subjectId: subDoc._id,
                    subjectName: subDoc.name,
                    title: item.title,
                    lessonNumber: idx + 1,
                    description: item.desc,
                    content: item.content,
                    videoUrl: `https://youtube.com/watch?v=sample_${subDoc._id}_${grade}_${idx}`,
                    duration: 15 + Math.floor(Math.random() * 15),
                    grade: grade,
                    status: 'published'
                });
                
                quizzes.push({
                    subjectId: subDoc._id,
                    subjectName: subDoc.name,
                    lessonId: lessonId,
                    title: `Bài tập trắc nghiệm: ${item.title}`,
                    description: `Kiểm tra kiến thức về ${item.title}`,
                    grade: [grade],
                    difficulty: 'easy',
                    questions: [
                        {
                            question: `Kỹ năng trọng tâm trong bài "${item.title}" là gì?`,
                            options: [
                                `${item.content.substring(0, 30)}...`,
                                `Chưa được đề cập`,
                                `Không có đáp án đúng`,
                                `Đáp án khác`
                            ],
                            answer: 0,
                            explanation: "Dựa vào nội dung bài học"
                        },
                        {
                            question: `Nhập môn "${subDoc.name}", tại sao nội dung này quan trọng?`,
                            options: [
                                `Giúp học sinh nắm vững căn bản`,
                                `Để thi học sinh giỏi`,
                                `Không quan trọng lắm`,
                                `Chỉ dành cho giáo viên`
                            ],
                            answer: 0,
                            explanation: "Vì đây là nội dung nền tảng."
                        }
                    ]
                });
            });
        }
    }
    
    console.log(`Inserting ${lessons.length} lessons and ${quizzes.length} quizzes...`);
    await Lesson.insertMany(lessons);
    await Quiz.insertMany(quizzes);
    
    console.log("✅ Done seeding primary school data (Grade 1-5)!");
    process.exit(0);
};

run();
