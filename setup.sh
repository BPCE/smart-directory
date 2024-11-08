if [[ ${WSL_DISTRO_NAME:-undef} != "undef" ]]; then #WSL
      export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64"
elif [[ ${WINDIR:-undef} == "undef" ]]; then # Linux
#on Linux, the good node version is not what is installed by default
	PATH=~/node-v17.9.0-linux-x64/bin:${PATH}
#
# solving Error: error:0308010C:digital envelope routines::unsupported
#
export SET NODE_OPTIONS=--openssl-legacy-provider
else # git bash
#on Windows node is supposed to be in the path and of the proper version
#on windows the the git sdk shlould be installed (https://github.com/git-for-windows/build-extra/releases/latest)
#the git sdk has make and python
    GIT_SDK_PATH=/c/git-sdk-64
    export JAVA_HOME=`cygpath -w /C/Program\ Files/java/jdk1.8.0_181`
    PATH=${PATH}:${GIT_SDK_PATH}/usr/bin
fi
