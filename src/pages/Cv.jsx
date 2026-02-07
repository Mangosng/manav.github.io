import React from 'react';

const Cv = () => {
    const Section = ({ title, children }) => (
        <div className="mb-12">
            <h2 className="text-lg font-bold uppercase tracking-terminal text-ink mb-4 border-b border-dotted border-structure pb-2">
                [ {title} ]
            </h2>
            {children}
        </div>
    );

    const SubSection = ({ title, children }) => (
        <div className="mb-4">
            <h3 className="text-sm font-bold uppercase tracking-terminal text-ink mb-2">
                {title}
            </h3>
            {children}
        </div>
    );

    const Item = ({ title, period, children }) => (
        <div className="mb-4 pl-4 border-l border-structure">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                <span className="text-sm font-semibold uppercase tracking-terminal text-ink">{title}</span>
                {period && <span className="text-xs uppercase tracking-terminal text-ink/50">{period}</span>}
            </div>
            {children}
        </div>
    );

    const BulletList = ({ items }) => (
        <ul className="text-xs text-ink/70 space-y-1 mt-1">
            {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                    <span className="text-ink/50">•</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );

    return (
        <main className="flex-grow flex flex-col items-center justify-start py-16 px-6">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-terminal text-center text-ink mb-12">
                [ CURRICULUM VITAE ]
            </h1>
            
            <div className="max-w-3xl w-full">
                
                {/* Extra-Curriculars */}
                <Section title="EXTRA-CURRICULARS">
                    <SubSection title="In-School">
                        <Item title="FRC 4308 Absolute Robotics" period="2023 - Present">
                            <div className="text-xs text-ink/70 space-y-2 mt-2">
                                <div>
                                    <p className="font-semibold text-ink/80">2023/2024 Season (Mechanical, Marketing)</p>
                                    <BulletList items={[
                                        "2nd place in Overtime Sunday",
                                        "Alliance Captains at Humber Event",
                                        "Excellence in Engineering Award at Humber Event",
                                        "Qualified for District Championship"
                                    ]} />
                                </div>
                                <div>
                                    <p className="font-semibold text-ink/80">2024/2025 Season (Admin Lead, Build Lead, Advanced Design, Drive Team, Marketing)</p>
                                    <BulletList items={[
                                        "1st place in Overtime Sunday",
                                        "3rd place at Humber Event",
                                        "Alliance Captains at McMaster Event",
                                        "Qualified for District Championship"
                                    ]} />
                                </div>
                                <div>
                                    <p className="font-semibold text-ink/80">2025/2026 Season (Awards Lead)</p>
                                </div>
                            </div>
                        </Item>

                        <Item title="The Woodlands DECA Chapter" period="2023 - Present">
                            <div className="text-xs text-ink/70 space-y-2 mt-2">
                                <div>
                                    <p className="font-semibold text-ink/80">2023/2024 (Principles in Marketing)</p>
                                    <BulletList items={[
                                        "Top 10 MC score (Regionals)",
                                        "Top 10 Overall (Regionals)",
                                        "Top 20 MC score (Provincials)"
                                    ]} />
                                </div>
                                <div>
                                    <p className="font-semibold text-ink/80">2024/2025 (Hospitality Services Team Decision Making)</p>
                                    <BulletList items={[
                                        "Junior Executive",
                                        "Top 10 Roleplay (Regionals)",
                                        "Top 10 Overall (Regionals)",
                                        "Provincial Qualification"
                                    ]} />
                                </div>
                            </div>
                        </Item>

                        <Item title="The Woodlands HOSA Chapter" period="2025/2026">
                            <BulletList items={["Medical Spelling"]} />
                        </Item>

                        <Item title="The Woodlands SACHSS" period="2025 - Present">
                            <BulletList items={["VP of Operations"]} />
                        </Item>

                        <div className="text-xs text-ink/70 space-y-1 mb-4 pl-4">
                            <p>• Member of Medlife (2025 - present)</p>
                            <p>• Member of Computer Science Club (2023 - present)</p>
                            <p>• Member of Aerospace Club (2024 - present)</p>
                            <p>• Member of the Debate Club (2023/2024)</p>
                        </div>

                        <Item title="The Woodlands Varsity Swim Team" period="2024 - Present">
                            <BulletList items={["ROPSAA Finalist 2024/2025 (100 IM and 400 Free Relay)"]} />
                        </Item>

                        <Item title="The Woodlands Pickleball Team" period="2024 - Present">
                            <BulletList items={["1st Place at Inaugural Woodlands Pickleball Tournament (Junior Boys Doubles)"]} />
                        </Item>

                        <div className="text-xs text-ink/70 space-y-1 mb-4 pl-4">
                            <p>• The Woodlands Cross Country Team (2025 - present)</p>
                            <p>• Member of Archery Club (2023/2024)</p>
                        </div>
                    </SubSection>

                    <SubSection title="Non-School">
                        <Item title="Toronto Model UN">
                            <BulletList items={["Outreach Team"]} />
                        </Item>

                        <Item title="2025 International Space Station Design Competition">
                            <BulletList items={[
                                "Team Canada/Great Lakes",
                                "Dougeldyne Aerospace - Good Samaritan Award"
                            ]} />
                        </Item>

                        <Item title="SHAD">
                            <BulletList items={[
                                "SHAD Fellow - University of Calgary (2025)",
                                "SHAD Ambassador (2025 - 2026)"
                            ]} />
                        </Item>

                        <Item title="STEMed Insights" period="2024 - 2025">
                            <BulletList items={[
                                "Content Team (2025)",
                                "Newsletter Team (2024)"
                            ]} />
                        </Item>

                        <div className="text-xs text-ink/70 space-y-1 mb-4 pl-4">
                            <p>• Youreka Canada Highschool Student Investigator (2025)</p>
                            <p>• JEC Council Member (2025)</p>
                            <p>• BioYouths - BioHistorian (2025)</p>
                            <p>• Leaf Machine Data Analysis - Data analyst (2025)</p>
                        </div>

                        <Item title="Scouts Canada" period="2017 - 2023">
                            <BulletList items={[
                                "Member of 3rd Streetsville Scouts Troop (2019 - 2023)",
                                "Patrol Leader (2023)",
                                "Member of 1st Streetsville Cub Scouts Troop (2017 - 2019)"
                            ]} />
                        </Item>
                    </SubSection>
                </Section>

                {/* Work Experience */}
                <Section title="WORK EXPERIENCE">
                    <Item title="City of Mississauga - Swimming Instructor / Lifeguard" period="Oct 2024 - Present" />
                </Section>

                {/* Volunteering Experience */}
                <Section title="VOLUNTEERING EXPERIENCE">
                    <div className="text-xs text-ink/70 space-y-1 pl-4">
                        <p>• City of Mississauga - Assistant Swimming Instructor - 109 hrs</p>
                        <p>• Sai Dham Food Bank - 56 hrs</p>
                        <p>• Volunteering Peel - 16 hrs</p>
                        <p>• Mississauga Youth Action Committee General Member - 19 hrs</p>
                        <p>• DECA Woodlands - 16 hrs</p>
                        <p>• FIRST Robotics - 10 hrs</p>
                    </div>
                </Section>

                {/* Awards */}
                <Section title="AWARDS">
                    <div className="text-xs text-ink/70 space-y-1 pl-4">
                        <p>• Bronze Award in Waterloo Financial Literacy Competition (FLC) (2024)</p>
                        <p>• Bronze Award in the American Mathematics Olympiad (AMO) (2023)</p>
                        <p>• Bronze Award in the Dr CT Competition (2023)</p>
                        <p>• Certificate of Distinction in the Gauss Contest (2023)</p>
                        <p>• Silver Award in the VANDA International Science Competition (2022)</p>
                        <p>• Certificate of Distinction in the Beaver Computing Challenge (BCC) (2022)</p>
                    </div>
                </Section>

                {/* Certifications */}
                <Section title="CERTIFICATIONS">
                    <div className="text-xs text-ink/70 space-y-1 pl-4">
                        <p>• Standard First Aid with CPR C</p>
                        <p>• National Lifeguard - Pool</p>
                        <p>• Swim Instructor</p>
                        <p>• Lifesaving Instructor</p>
                        <p>• Emergency First Aid Instructor</p>
                        <p>• High Five: Principles of Healthy Child Development</p>
                    </div>
                </Section>

            </div>
        </main>
    );
};

export default Cv;
