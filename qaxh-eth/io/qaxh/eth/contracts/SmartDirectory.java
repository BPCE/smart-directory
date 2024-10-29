package io.qaxh.eth.contracts;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.DynamicArray;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tuples.generated.Tuple2;
import org.web3j.tuples.generated.Tuple7;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 1.4.2.
 */
@SuppressWarnings("rawtypes")
public class SmartDirectory extends Contract {
    public static final String BINARY = "Bin file was not provided";

    public static final String FUNC_ADDREFERENCE = "addReference";

    public static final String FUNC_UPDATEREFERENCESTATUS = "updateReferenceStatus";

    public static final String FUNC_UPDATEREGISTRANTURI = "updateRegistrantUri";

    public static final String FUNC_GETREFERENCE = "getReference";

    public static final String FUNC_GETREFERENCESTATUS = "getReferenceStatus";

    public static final String FUNC_GETREFERENCESLISTS = "getReferencesLists";

    public static final String FUNC_GETREGISTRANTREFERENCESCOUNT = "getRegistrantReferencesCount";

    public static final String FUNC_GETREGISTRANTURI = "getRegistrantUri";

    public static final String FUNC_GETREGISTRANTLASTINDEX = "getRegistrantLastIndex";

    public static final String FUNC_GETREGISTRANTINDEX = "getRegistrantIndex";

    public static final String FUNC_VERSION = "version";

    public static final String FUNC_SETSMARTDIRECTORYACTIVATION = "setSmartDirectoryActivation";

    @Deprecated
    protected SmartDirectory(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected SmartDirectory(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected SmartDirectory(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected SmartDirectory(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public RemoteFunctionCall<TransactionReceipt> addReference(String _referenceAddress, String _projectId, String _referenceType, String _referenceVersion, BigInteger _status, String _registrantUri) {
        final Function function = new Function(
                FUNC_ADDREFERENCE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _referenceAddress), 
                new org.web3j.abi.datatypes.Utf8String(_projectId), 
                new org.web3j.abi.datatypes.Utf8String(_referenceType), 
                new org.web3j.abi.datatypes.Utf8String(_referenceVersion), 
                new org.web3j.abi.datatypes.generated.Uint8(_status), 
                new org.web3j.abi.datatypes.Utf8String(_registrantUri)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> updateReferenceStatus(String _referenceAddress, BigInteger _status) {
        final Function function = new Function(
                FUNC_UPDATEREFERENCESTATUS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _referenceAddress), 
                new org.web3j.abi.datatypes.generated.Uint8(_status)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> updateRegistrantUri(String _registrantUri) {
        final Function function = new Function(
                FUNC_UPDATEREGISTRANTURI, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Utf8String(_registrantUri)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<Tuple7<String, String, String, String, String, BigInteger, BigInteger>> getReference(String _referenceAddress) {
        final Function function = new Function(FUNC_GETREFERENCE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _referenceAddress)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Address>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Uint8>() {}, new TypeReference<Uint256>() {}));
        return new RemoteFunctionCall<Tuple7<String, String, String, String, String, BigInteger, BigInteger>>(function,
                new Callable<Tuple7<String, String, String, String, String, BigInteger, BigInteger>>() {
                    @Override
                    public Tuple7<String, String, String, String, String, BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple7<String, String, String, String, String, BigInteger, BigInteger>(
                                (String) results.get(0).getValue(), 
                                (String) results.get(1).getValue(), 
                                (String) results.get(2).getValue(), 
                                (String) results.get(3).getValue(), 
                                (String) results.get(4).getValue(), 
                                (BigInteger) results.get(5).getValue(), 
                                (BigInteger) results.get(6).getValue());
                    }
                });
    }

    public RemoteFunctionCall<Tuple2<BigInteger, BigInteger>> getReferenceStatus(String _referenceAddress, BigInteger _index) {
        final Function function = new Function(FUNC_GETREFERENCESTATUS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _referenceAddress), 
                new org.web3j.abi.datatypes.generated.Uint256(_index)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint8>() {}, new TypeReference<Uint256>() {}));
        return new RemoteFunctionCall<Tuple2<BigInteger, BigInteger>>(function,
                new Callable<Tuple2<BigInteger, BigInteger>>() {
                    @Override
                    public Tuple2<BigInteger, BigInteger> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple2<BigInteger, BigInteger>(
                                (BigInteger) results.get(0).getValue(), 
                                (BigInteger) results.get(1).getValue());
                    }
                });
    }

    public RemoteFunctionCall<Tuple2<List<String>, List<String>>> getReferencesLists(String _registrantAddress) {
        final Function function = new Function(FUNC_GETREFERENCESLISTS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _registrantAddress)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<DynamicArray<Address>>() {}, new TypeReference<DynamicArray<Utf8String>>() {}));
        return new RemoteFunctionCall<Tuple2<List<String>, List<String>>>(function,
                new Callable<Tuple2<List<String>, List<String>>>() {
                    @Override
                    public Tuple2<List<String>, List<String>> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple2<List<String>, List<String>>(
                                convertToNative((List<Address>) results.get(0).getValue()), 
                                convertToNative((List<Utf8String>) results.get(1).getValue()));
                    }
                });
    }

    public RemoteFunctionCall<BigInteger> getRegistrantReferencesCount(String _registrantAddress) {
        final Function function = new Function(FUNC_GETREGISTRANTREFERENCESCOUNT, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _registrantAddress)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteFunctionCall<String> getRegistrantUri(String _registrantAddress) {
        final Function function = new Function(FUNC_GETREGISTRANTURI, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _registrantAddress)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Utf8String>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<BigInteger> getRegistrantLastIndex() {
        final Function function = new Function(FUNC_GETREGISTRANTLASTINDEX, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteFunctionCall<BigInteger> getRegistrantIndex(String _registrantAddress) {
        final Function function = new Function(FUNC_GETREGISTRANTINDEX, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _registrantAddress)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    public RemoteFunctionCall<String> version() {
        final Function function = new Function(FUNC_VERSION, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Utf8String>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<TransactionReceipt> setSmartDirectoryActivation(BigInteger _code) {
        final Function function = new Function(
                FUNC_SETSMARTDIRECTORYACTIVATION, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.generated.Uint8(_code)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static SmartDirectory load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new SmartDirectory(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static SmartDirectory load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new SmartDirectory(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static SmartDirectory load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new SmartDirectory(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static SmartDirectory load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new SmartDirectory(contractAddress, web3j, transactionManager, contractGasProvider);
    }
}
