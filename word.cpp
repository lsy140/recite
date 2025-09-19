#include <iostream> // 包含输入输出流库
#include <fstream>  // 包含文件流库
#include <vector>   // 包含向量容器库
#include <unordered_map> // 包含无序映射容器库
#include <string>   // 包含字符串库
#include <algorithm> // 包含算法库
#include <random>   // 包含随机数生成库
#include <ctime>    // 包含时间库
#include <limits>

#define RED     "\033[31m"
#define RESET   "\033[0m"    // 重置所有属性
#define BLUE    "\033[34m"   // 蓝色前景

using namespace std; // 使用标准命名空间

string filename = "/mnt/d/桌面/test.csv"; // 文件名，用于持久化存储

struct VocabPair {
    string chinese; // 中文单词
    string english; // 英文单词
    int count;
};

class VocabularyApp {
private:
    vector<VocabPair> vocabList; // 存储词汇对的向量
    // string filename1 = "/mnt/d/桌面/vocab_data1.csv";
public:
    VocabularyApp() {
        loadVocabulary(); // 构造函数中调用加载词汇函数
    }

    void addVocabulary(const string& chinese, const string& english) {
        VocabPair vp{chinese, english,0}; // 创建一个新的词汇对
            vocabList.push_back(vp); // 如果不存在，则添加到向量中
    }

    void saveVocabulary() {
        ofstream outFile(filename); // 打开文件以写入模式
        if (!outFile.is_open()) { // 检查文件是否成功打开
            cerr << "Error opening file for writing." << endl; // 输出错误信息
            return;
        }
        for (const auto& vp : vocabList) { // 遍历所有词汇对
            outFile << vp.chinese << "," << vp.english << "," << vp.count << "\n"; // 写入文件
        }
        outFile.close(); // 关闭文件
    }

    void loadVocabulary() {
        ifstream inFile(filename); // 打开文件以读取模式
        if (!inFile.is_open()) { // 检查文件是否成功打开
            cout << "No existing vocabulary data found. Starting fresh." << endl; // 输出提示信息
            return;
        }
        string line;
        while (getline(inFile, line)) { // 逐行读取文件内容
            size_t commaPos1 = line.find(','); // 查找第一个逗号位置
            size_t commaPos2 = line.find(',', commaPos1 + 1); // 查找第二个逗号位置
            if (commaPos1 != string::npos && commaPos2 != string::npos) { // 确保找到两个逗号
                string chinese = line.substr(0, commaPos1); // 提取中文部分
                string english = line.substr(commaPos1 + 1, commaPos2 - commaPos1 - 1); // 提取英文部分
                int count = stoi(line.substr(commaPos2 + 1)); // 提取正确回答次数
                VocabPair vp{chinese, english,count}; // 创建新的词汇对
                vocabList.push_back(vp); // 添加到向量中
            }
        }
        inFile.close(); // 关闭文件
    }

    void learningMode() {
        random_device rd; // 创建随机设备对象
        mt19937 gen(rd()); // 创建随机数生成器
        uniform_int_distribution<> dis(0, vocabList.size() - 1); // 创建均匀分布对象
        int flag=-1;// 转换中英标志;
        string answer;
        std::vector<int> numbers(vocabList.size());// 创建一个乱序数组，用于存储索引
        for (int i = 0; i < vocabList.size(); ++i) {
            numbers[i] = i;
        }
        std::shuffle(numbers.begin(), numbers.end(), gen);// 使用std::shuffle来随机打乱数组

        for (size_t i = 0; i < vocabList.size(); ++i) { // 遍历所有词汇对
            int index = numbers[i];
            VocabPair currentVP = vocabList[index]; // 获取当前词汇对
            vector<string> options;
            if(flag==-1){
                options.push_back(currentVP.english); // 将正确答案加入选项
                answer = currentVP.english;
                // Generate three wrong options // 生成三个错误选项
            }else{
                options.push_back(currentVP.chinese); // 将正确答案加入选项
                answer = currentVP.chinese;
                // Generate three wrong options // 生成三个错误选项
                while (options.size() < 4) {
                    int wrongIndex = dis(gen); // 随机选择一个索引
                    if (wrongIndex != index&&
                    find(options.begin(), options.end(), vocabList[wrongIndex].chinese)==options.end()) { // 确保不是正确答案
                        options.push_back(vocabList[wrongIndex].chinese); // 加入错误选项
                    }
                }
            }
            

            shuffle(options.begin(), options.end(), gen); // 打乱选项顺序
            if(flag==-1){
                cout << "inputing the English translation of \"" << currentVP.chinese << "\"?" << endl; // 提示用户翻译
            }else{
                cout << "What is the Chinese translation of \"" << currentVP.english << "\"?" << endl; // 提示用户翻译
                for (int j = 0; j < 4; ++j) {
                    cout << j + 1 << ". " << options[j] << endl; // 显示选项
                }

            }

            string userAnswer;
            if (flag==-1)
            {
                cin.ignore();
                getline(cin,userAnswer);
            }else{
                int intAnswer;
                cin >> intAnswer; // 获取用户输入的答案
                if (intAnswer>=1&&intAnswer<=4)
                {
                    userAnswer = options[intAnswer-1];
                }else {
                    cin.clear(); // 清除输入错误状态
                    cin.ignore(numeric_limits<streamsize>::max(), '\n'); // 清空缓冲区
                    cout << "Invalid input." << endl;
                    continue;
                }
                    
            }
            if (userAnswer==answer) { // 检查答案是否正确
                cout << BLUE<<"Correct!" <<RESET<< endl; // 正确提示
                vocabList[index].count++; // 更新正确回答次数
            } else {
                cout << RED<<"Incorrect! The correct answer was: " << answer<<RESET << endl; // 错误提示
            }
            flag*=-1;
        }
        cout << "今日学习已完成" << endl; // 完成一轮学习提示
        for (int i = 0; i < vocabList.size(); ++i) { // 更新文件
            if (vocabList[i].count > 6) { // 如果正确回答次数大于等于3次，则删除该词汇对
                vocabList.erase(vocabList.begin() + i);
                --i;
            }
        }
        saveVocabulary();
    }

    void run() {
        string command;
        while (true) { // 主循环
            cout << "Enter a command\n(1)add:\n(2)start:\n"; // 提示用户输入命令
            cin >> command; // 获取用户输入的命令
            if (command == "1") { // 添加新词汇对命令
                string chinese, english;
                cout << "Enter Chinese word: ";
                cin.ignore(); // 忽略换行符
                getline(cin, chinese); // 获取中文单词
                // cin>>chinese;
                cout << "Enter English word: ";
                cin.ignore();
                getline(cin, english); // 获取英文单词
                // cin>>english;
                addVocabulary(chinese, english); // 添加词汇对
            } else if (command == "2") { // 开始学习模式命令
                // cin.ignore();
                learningMode();
                
            } else if (command == "q") { // 退出程序命令
                // cin.ignore();
                saveVocabulary(); // 保存当前进度
                break;
            } else {
                cout << "Unknown command. Please try again." << endl; // 未知命令提示
            }
        }
    }
};

int main() {
    VocabularyApp app; // 创建应用程序实例
    app.run(); // 运行应用程序
    return 0;
}
