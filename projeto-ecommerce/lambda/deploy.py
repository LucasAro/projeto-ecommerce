import os
import shutil
import subprocess
import zipfile

def create_deployment_package():
    # Criar diretório temporário
    if os.path.exists('package'):
        shutil.rmtree('package')
    os.makedirs('package')

    # Copiar handler.py
    shutil.copy2('handler.py', 'package/handler.py')

    # Instalar dependências no diretório package
    subprocess.check_call([
        'pip',
        'install',
        '-r',
        'requirements.txt',
        '--target',
        'package'
    ])

    # Criar arquivo ZIP
    with zipfile.ZipFile('function.zip', 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('package'):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, 'package')
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    create_deployment_package()
    print("Pacote de deployment criado com sucesso!")