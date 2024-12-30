'use client';

import Image from "next/image";
import Qaxh from "/public/qaxh.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Github } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <Image
              src={Qaxh}
              alt="SmartDirectory Logo"
              width={150}
              height={150}
              className="rounded-lg"
              priority
            />
            <div className="text-left space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
                SmartDirectory (Mission Smart2)
              </h1>
              <p className="text-xl text-muted-foreground">
                Avec l'essor prévisible des smartContracts, notamment en raison de la tokenisation de l'économie 
                et de l'account abstraction, il devient primordial de simplifier la création de listes de références. 
                Ces listes, destinées à des usages publics ou privés, doivent pouvoir exister aussi bien à l'intérieur 
                qu'à l'extérieur de la blockchain.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Card className="border border-border/50">
            <CardContent className="prose prose-gray dark:prose-invert max-w-none p-8 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Problématique : la multiplication des smartContracts</h2>
                <p>
                  La vision autour des smartContracts a fortement évolué dans l'écosystème Blockchain, principalement 
                  Ethereum. Initialement ils étaient perçus comme des artefacts quasi-uniques dont l'utilisation est 
                  garantie par la connaissance de l'adresse du smartContract. Une telle sécurité d'utilisation nécessite 
                  que chaque utilisateur gère par ses propres moyens, la liste des adresses à laquelle il fait confiance.
                </p>
                <p>
                  Cette approche pose un réel souci dès lors que le nombre de smartContracts utilisés par chaque utilisateur 
                  augmente. Par ailleurs, ceci oblige à mettre l'adresse des smartContracts en dur dans le code d'autres 
                  smartContracts dès lors que certains processus nécessitent une vérification on-chain impliquant plusieurs 
                  smartContracts.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Depuis 2 à 3 ans, deux nouvelles orientations sont considérées comme inévitables :</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>l'account abstraction, qui va permettre une meilleure interaction utilisateur (paiement de GAS par un tiers, protection contre la perte de clés privées),</li>
                  <li>la tokenisation de l'économie qui nécessite une représentation des actifs du monde réel sous forme de token fongibles ou non fongibles.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Ces deux orientations vont nécessiter :</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>la création de smartContracts en grands nombres pour les actifs et les utilisateurs,</li>
                  <li>la création de smartContracts liés à la gestion des processus des actifs, en nombre guère plus restreint, avec un besoin de contrôles des smartContracts précédents dans toutes les étapes de leur propre exécution.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">En synthèse, nous identifions les besoins génériques suivants :</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Une facilité de déploiement de nouveaux smartContracts.</li>
                  <li>Une capacité de contrôle de la validité de ces smartContracts par un utilisateur externe à la blockchain.</li>
                  <li>Une capacité de contrôle de la validité de ces smartContracts par un autre smartContract.</li>
                  <li>Une nécessité d'identifier des écosystèmes de smartContracts pour en faire une analyse.</li>
                  <li>Une capacité de maintenir à jour ces écosystèmes.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Link */}
          <div className="flex justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => window.open('https://github.com/BPCE/smart-directory', '_blank')}
              className="gap-2 text-lg px-8 hover:scale-105 transition-transform"
            >
              <Github className="w-6 h-6" />
              Voir le projet sur GitHub
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

