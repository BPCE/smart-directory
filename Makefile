
contractFiles=SmartDirectory
openZeppelinPaths=
facetFiles=

developmentPrefix=../appinventor_external/
targetProjectDir=qaxh-eth
javaTargetDirectory=$(targetProjectDir)/src/io/qaxh/eth/contracts/
web3j=../web3j-cli/web3j-1.4.2/bin/web3j

TODO = $(addprefix $(developmentPrefix), $(addprefix $(javaTargetDirectory), $(addsuffix .java, $(contractFiles))))


all: $(TODO)

$(developmentPrefix)$(targetProjectDir)/src/io/qaxh/eth/contracts/%.java: $(developmentPrefix)$(targetProjectDir)/src/io/qaxh/eth/contracts/%.java-web3j-1.4.2
	sed -e 's/public static List</public List</g' -e 's/staticExtractEventParametersWithLog/extractEventParametersWithLog/g'<$< >$@

$(developmentPrefix)$(targetProjectDir)/src/io/qaxh/eth/contracts/%.java-web3j-1.4.2: build/abi/%.json
	$(info from)
	$(info $<)
	$(info to)
	$(info $@)
	$(info file)
	$(info $(@F))
	$(web3j) generate solidity --abiFile build/abi/$(notdir $(basename $<).json) -o $(developmentPrefix)$(targetProjectDir)/src --package=io.qaxh.eth.contracts
	mv $(@D)/$(*F).java $@

build/abi/%.json: build/contracts/%.json
	npx truffle-abi

clean:
	rm -f build/abi/*.json
	rm -f $(developmentPrefix)$(targetProjectDir)/src/io/qaxh/eth/contracts/1.4.2/*.java*
	rm -f $(developmentPrefix)$(targetProjectDir)/src/io/qaxh/eth/contracts/*.java*



