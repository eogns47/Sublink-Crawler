import time
import os
import sys
from tqdm import tqdm
import logging
import io
import subprocess


class TqdmToLogger(io.StringIO):
    """
        Output stream for TQDM which will output to logger module instead of
        the StdOut.
    """
    logger = None
    level = None
    buf = ''

    def __init__(self, logger, level=None):
        super(TqdmToLogger, self).__init__()
        self.logger = logger
        self.level = level or logging.INFO

    def write(self, buf):
        self.buf = buf.strip('\r\n\t ')

    def flush(self):
        self.logger.log(self.level, self.buf)


# inputs 디렉토리 경로 설정
# -------------------------------------------- Setting relative path --------------------------------------------#
script_path = os.path.abspath(__file__)
path_parts = script_path.split('/')
root_index = path_parts.index('ExecBot')
relative_path_parts = path_parts[:root_index]
relative_path = '/'.join(relative_path_parts)

# # 로그 파일 설정
logging.basicConfig(filename=relative_path+'/logs/exec.log',
                    format='(%(asctime)s) %(levelname)s:%(message)s',
                    level=logging.DEBUG)
logger = logging.getLogger()

# -------------------------------------------- Reading targets.txt --------------------------------------------#
input_directory = os.path.join(relative_path, 'inputs')
target_file_path = os.path.join(input_directory, 'targets.txt')

url_list = []
# targets.txt 파일 읽기
with open(target_file_path, 'r') as file:
    file_content = file.read()
    url_list = file_content.split('\n')


# -------------------------------------------- Executing link-crawler --------------------------------------------#
def check_ResultFile_exist(resultFile):
    # resultFile이 존재하지 않으면 생성
    resultPath = relative_path+'/results/'+resultFile
    if not os.path.exists(resultPath):
        os.system(f'touch {resultPath}')
        print(f'{resultPath} is created')
    else:
        print(f'{resultFile} is already exist')
        exit(0)


def check_ErrorListFile_exist(resultFile):
    # errorListFile이 존재하지 않으면 생성
    errorListPath = relative_path+'/results/errorList.txt'
    if not os.path.exists(errorListPath):
        os.system(f'touch {errorListPath}')
        with open(errorListPath, 'a') as errorFile:
            errorFile.write(f'🚨ErrorList of {resultFile} 🚨\n')
    else:
        # 에러리스트 파일에 hello 작성
        with open(errorListPath, 'a') as errorFile:
            errorFile.write(f'🚨ErrorList of {resultFile} 🚨\n')


def exec_link_crawler(resultFile, depth: int):
    # link-crawler 폴더 경로 설정
    parent_directory = os.path.join(relative_path, "src")
    # 한 단계 위 폴더로 실행 위치 변경
    os.chdir(parent_directory)
    tqdm_out = TqdmToLogger(logger, level=logging.INFO)
    logger.info('🚀 Crawling For %s', resultFile)
    logger.info('⏰ Crawling Start time: %s', time.strftime(
        '%Y-%m-%d %H:%M:%S', time.localtime(time.time())))
    for url in tqdm(url_list, desc='Crawling Processing', unit='item', file=tqdm_out, mininterval=30):
        # 0.5초 대기
        os.system(f'rm ../inputs/tmp.txt')
        os.system(f'echo {url} >> ../inputs/tmp.txt')
        # os.system(f'node index.js -t tmp.txt -r test.txt -d 1')

        command = "node index.js -t tmp.txt -r " + resultFile + " -d " + depth
        result = subprocess.Popen(command, shell=True)
        returncode = result.wait()

    logger.info('⏰ Crawling End time: %s', time.strftime(
        '%Y-%m-%d %H:%M:%S', time.localtime(time.time())))


# -------------------------------------------- Main --------------------------------------------#
if __name__ == "__main__":
    argv = sys.argv
    if (len(argv) < 3):
        print("Usage: python3 exec.py [resultFile] [depth]")
    elif (len(argv) == 3):
        check_ResultFile_exist(argv[1])
        check_ErrorListFile_exist(argv[1])
        exec_link_crawler(argv[1], argv[2])
    else:
        print("Usage: python3 exec.py [resultFile] [depth]")
