'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

import { getAllRegistrants, getAllReferences, getReferenceStatus, getReference, getRegistrant, getContractURI } from './chainCall'
import next from 'next'

const SmartDirectory = () => {
  //-------state----------
  const [inputAddress, setInputAddress] = useState('');
  const [addressSMDIR, setAddressSMDIR] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000')
  const [allRegistrants, setAllRegistrants] = useState<readonly [`0x${string}`, string][]>([])
  const [registrantAddress, setRegistrantAddress] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000')
  const [allReferences, setAllReferences] = useState<readonly [`0x${string}`, string][]>([])
  const [referenceAddress, setReferenceAddress] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000')
  const [allReferenceStatus, setAllReferenceStatus] = useState<readonly (readonly [string, bigint])[] | null>(null)
  const [searchRegistrant, setSearchRegistrant] = useState('');
  const [searchReference, setSearchReference] = useState('');
  const [contractURI, setContractURI] = useState('');

  //-------functions----------
  const fetchRegistrants = async () => {
    if (addressSMDIR === '0x0000000000000000000000000000000000000000') {
      return
    }
    const AllRegistrants = await getAllRegistrants(addressSMDIR)
    setAllRegistrants(AllRegistrants as unknown as readonly [`0x${string}`, string][]);
  };

  const fetchRegistrant = async () => {
    if (searchRegistrant === '') {
      return
    }
    const registrantData = await getRegistrant(addressSMDIR, searchRegistrant as `0x${string}`)
    setAllReferences(registrantData as unknown as readonly [`0x${string}`, string][]);
  };

  const fetchReferences = async () => {
    if (registrantAddress === '0x0000000000000000000000000000000000000000') {
      return
    }
    const AllReferences = await getAllReferences(addressSMDIR, registrantAddress)
    setAllReferences(AllReferences as unknown as readonly [`0x${string}`, string][]);
  };

  const fetchReference = async () => {
    if (searchReference === '') {
      return
    }
    const referenceData = await getReference(addressSMDIR, searchReference as `0x${string}`)
    setAllReferences(referenceData as unknown as readonly [`0x${string}`, string][]);
  };

  const fetchReferenceStatus = async () => {
    if (referenceAddress === '0x0000000000000000000000000000000000000000') {
      return
    }
    const allReferencesData = await getReferenceStatus(addressSMDIR, referenceAddress)
    setAllReferenceStatus(allReferencesData as readonly (readonly [string, bigint])[]);
  };
  
  const fetchContractURI = async () => {
    if (addressSMDIR === '0x0000000000000000000000000000000000000000') {
      return
    }
    const uri = await getContractURI(addressSMDIR)
    setContractURI(uri as string);
  };

  const convertTimestampToParisTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  //-------click handlers----------
  const handleRegistrantClick = (address: `0x${string}`) => {
    setRegistrantAddress(address);
  };
  const handleReferenceClick = (address: `0x${string}`) => {
    setReferenceAddress(address);
  };
  const handleAddressSubmit = () => {
    setAddressSMDIR(inputAddress.trimEnd() as `0x${string}`);
  };
  const handleSearchRegistrant = () => {
    if (searchRegistrant){
      fetchRegistrant()
    }
  };
  const handleSearchReference = () => {
    if (searchReference){
      fetchReference()
    }
  };

  //-------search filters----------
  const filteredRegistrants = allRegistrants.filter(registrant => 
    registrant[0].toLowerCase().includes(searchRegistrant.toLowerCase()) ||
    registrant[1].toLowerCase().includes(searchRegistrant.toLowerCase())
  );

  const filteredReferences = allReferences.filter(reference => 
    reference[0].toLowerCase().includes(searchReference.toLowerCase()) ||
    reference[1].toLowerCase().includes(searchReference.toLowerCase())
  );
  
  //-------useEffect----------
  useEffect(() => {
    fetchRegistrants();
    fetchContractURI();
  }, [addressSMDIR])
  
  useEffect(() => {
    fetchReferences()
  }, [registrantAddress])

  useEffect(() => {
    fetchReferenceStatus()
  }, [referenceAddress])

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex-2">
            <CardHeader>
              <CardTitle>SmartDirectory :</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="Enter Smart Directory Address"
                  className="flex-1"
                />
                <Button onClick={handleAddressSubmit}>
                  Submit
                </Button>
              </div>
              {contractURI ? (
                <>
                  <span className="text-sm text-gray-500">Contract documentation or link to administration authority web site : </span>
                  <Link href={contractURI} target="_blank" className="text-blue-500 break-words">
                    {contractURI}
                  </Link>
                </>
              ) : (
                <></>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{addressSMDIR!=='0x0000000000000000000000000000000000000000'?addressSMDIR:"⬆️ paste your SmartDirectory address there ⬆️ try this one as exemple : 0x88CBa1e32db10CE775210C80A39F407EAA982E0D 📝"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Registrants List</CardTitle>
              <span className="text-sm text-gray-500">Click on a registrant to see its references</span>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  value={searchRegistrant}
                  onChange={(e) => setSearchRegistrant(e.target.value)}
                  placeholder="Enter registrant address"
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => {
                  setSearchRegistrant(searchRegistrant.trim());
                  handleSearchRegistrant();
                }}>
                  <Search className="h-4 w-4" />
                </Button>
                </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>URI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrants.map((registrant: any, index: any) => (
                    <TableRow key={index} onClick={() => handleRegistrantClick(registrant[0])} className={registrantAddress === registrant[0] ? "bg-muted" : ""}>
                      <TableCell>{registrant[0]}</TableCell>
                      <TableCell>
                        <Link href={registrant[1]} target="_blank" className="text-blue-500 break-words">
                          {registrant[1]}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>References</CardTitle>
            <span className="text-sm text-gray-500">Click on a reference to see its status</span>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={searchReference}
                onChange={(e) => setSearchReference(e.target.value)}
                placeholder="Enter smartcontract address"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleSearchReference}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Smartcontract Address (Reference)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>ProjectID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>timestamp</TableHead>
                  <TableHead>registrantAddress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReferences.map((reference: any, index: any) => (
                  <TableRow key={index} onClick={() => handleReferenceClick(reference[2])} className={referenceAddress === reference[2] ? "bg-muted" : ""}>
                    <TableCell>{reference[2]}</TableCell>
                    <TableCell>{reference[8]}</TableCell>
                    <TableCell>{reference[3]}</TableCell>
                    <TableCell>{reference[4]}</TableCell>
                    <TableCell>{reference[5]}</TableCell>
                    <TableCell>{convertTimestampToParisTime(reference[7])}</TableCell>
                    <TableCell>{reference[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected reference : {referenceAddress!=='0x0000000000000000000000000000000000000000'?referenceAddress:"choose one there ↗️"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date of status change</TableHead>
                  <TableHead>status after change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allReferenceStatus && [...allReferenceStatus].sort((a: readonly [string, bigint], b: readonly [string, bigint]) => Number(b[1]) - Number(a[1])).map((referenceStatus: readonly [string, bigint], index: number) => (
                  <TableRow key={index}>
                    <TableCell>{convertTimestampToParisTime(referenceStatus[1])}</TableCell>
                    <TableCell>{referenceStatus[0]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default SmartDirectory

