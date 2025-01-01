'use client'

import { useEffect, useState } from 'react'

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

import { getAllRegistrants, getAllReferences, getReferenceStatus, getReference, getRegistrant } from './chainCall'

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
    setAddressSMDIR(inputAddress as `0x${string}`);
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
    fetchRegistrants()
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>{addressSMDIR!=='0x0000000000000000000000000000000000000000'?addressSMDIR:"⬆️ paste your SmartDirectory address there ⬆️ try this one as exemple : 0x4f0aFf36f83b2bb16789728Da7F32CF91d427ecA 📝 or this one : 0x623a73351159c85cdb0d3cd8665ab13dbf42f4f2 📝 "}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Registrants List</CardTitle>
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
                <Button variant="outline" size="icon" onClick={handleSearchRegistrant}>
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
                      <TableCell>{registrant[1]}</TableCell>
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
                  <TableHead>Last Status</TableHead>
                  <TableHead>ProjectID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>status</TableHead>
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
                    <TableCell>{reference[6]}</TableCell>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Commentary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allReferenceStatus?.map((referenceStatus: any, index: any) => (
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

