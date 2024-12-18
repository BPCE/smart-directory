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

import { getAllRegistrants, getAllReferences, getReferenceStatus } from './chainCall'


const SmartDirectory = () => {
  //-------state----------
  const [inputAddress, setInputAddress] = useState('');
  const [addressSMDIR, setAddressSMDIR] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000')
  const [allRegistrants, setAllRegistrants] = useState<readonly [`0x${string}`, string][]>([])
  const [registrantAddress, setRegistrantAddress] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000')
  const [allReferences, setAllReferences] = useState<readonly [`0x${string}`, string][]>([])
  const [referenceAddress, setReferenceAddress] = useState<`0x${string}`>('0x0000000000000000000000000000000000000000')
  const [allReferenceStatus, setAllReferenceStatus] = useState<readonly [string, bigint] | null>(null)

  //-------functions----------
  const fetchRegistrants = async () => {
    if (addressSMDIR === '0x0000000000000000000000000000000000000000') {
      return
    }
    const AllRegistrants = await getAllRegistrants(addressSMDIR)
    setAllRegistrants(AllRegistrants as unknown as readonly [`0x${string}`, string][]);
  };

  const fetchReferences = async () => {
    if (registrantAddress === '0x0000000000000000000000000000000000000000') {
      return
    }
    const AllReferences = await getAllReferences(addressSMDIR, registrantAddress)
    const formattedReferences = AllReferences[0].map((ref: string, index: number) => [ref, AllReferences[1][index]]);
    setAllReferences(formattedReferences as unknown as readonly [`0x${string}`, string][]);
  };

  const fetchReferenceStatus = async () => {
    if (referenceAddress === '0x0000000000000000000000000000000000000000') {
      return
    }
    const allReferencesData = await getReferenceStatus(addressSMDIR, referenceAddress)
    setAllReferenceStatus(allReferencesData);
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
  
  //-------useEffect----------
  useEffect(() => {
    fetchRegistrants()
  }, [addressSMDIR])
  
  useEffect(() => {
    fetchReferences()
  }
  , [registrantAddress])
  useEffect(() => {
    fetchReferenceStatus()
  }
  , [referenceAddress])


  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
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
                  {/* <TableHead>Status</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{addressSMDIR!=='0x0000000000000000000000000000000000000000'?addressSMDIR:"⬆️ paste your SmartDirectory address there ⬆️ try this one as exemple : 0x4f0aFf36f83b2bb16789728Da7F32CF91d427ecA 📝"}</TableCell>
                  {/* <TableCell>active</TableCell> */}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Registrants List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>URI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRegistrants.map((registrant: any, index: any) => (
                    <TableRow key={index} onClick={() => handleRegistrantClick(registrant[0])}>
                      <TableCell>{registrant[0]}</TableCell>
                      <TableCell>{registrant[1]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>References</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>ProjectID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allReferences.map((reference: any, index: any) => (
                    <TableRow key={index} onClick={() => handleReferenceClick(reference[0])}>
                      <TableCell>{reference[0]}</TableCell>
                      <TableCell>{reference[1]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Selected reference : {referenceAddress!=='0x0000000000000000000000000000000000000000'?referenceAddress:"choose one there ↗️"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Commentary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allReferenceStatus && (
                  <TableRow>
                    <TableCell>{allReferenceStatus[0]}</TableCell>
                    <TableCell>{convertTimestampToParisTime(allReferenceStatus[1])}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default SmartDirectory

